import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, generateResetToken, hashResetToken } from '../lib/tokens';
import { sendError, sendSuccess } from '../lib/errors';
import { sendPasswordResetEmail } from '../lib/mail';
import { handleValidation } from '../middleware/validate';

const router = Router();

// ─── POST /auth/register ─────────────────────────────────

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    body('userType').isIn(['VENDOR', 'CLIENT']).withMessage('User type must be VENDOR or CLIENT'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, phone, userType } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        sendError(res, { status: 409, code: 'EMAIL_EXISTS', message: 'An account with this email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { firstName, lastName, email, passwordHash, phone, userType },
      });

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, userType: user.userType });
      const { token: refreshToken, expiresAt } = generateRefreshToken();

      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt },
      });

      sendSuccess(res, {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, userType: user.userType },
        accessToken,
        refreshToken,
      }, 201);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Registration failed' });
    }
  }
);

// ─── POST /auth/login ────────────────────────────────────

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        sendError(res, { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
        return;
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        sendError(res, { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
        return;
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, userType: user.userType });
      const { token: refreshToken, expiresAt } = generateRefreshToken();

      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt },
      });

      sendSuccess(res, {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, userType: user.userType },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Login failed' });
    }
  }
);

// ─── POST /auth/refresh ──────────────────────────────────

router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!stored) {
        sendError(res, { status: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' });
        return;
      }

      if (stored.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
        sendError(res, { status: 401, code: 'REFRESH_TOKEN_EXPIRED', message: 'Refresh token has expired' });
        return;
      }

      const accessToken = generateAccessToken({
        userId: stored.user.id,
        email: stored.user.email,
        userType: stored.user.userType,
      });

      sendSuccess(res, { accessToken });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Token refresh failed' });
    }
  }
);

// ─── POST /auth/logout ───────────────────────────────────

router.post(
  '/logout',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Logout failed' });
    }
  }
);

// ─── POST /auth/forgot-password ──────────────────────────

router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Always return success to prevent email enumeration
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        sendSuccess(res, { message: 'If an account with that email exists, a reset link has been sent' });
        return;
      }

      // Invalidate any existing reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const { token, tokenHash, expiresAt } = generateResetToken();

      await prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      await sendPasswordResetEmail(email, token);

      sendSuccess(res, { message: 'If an account with that email exists, a reset link has been sent' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Password reset request failed' });
    }
  }
);

// ─── POST /auth/reset-password ───────────────────────────

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      const tokenHash = hashResetToken(token);

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: { tokenHash, usedAt: null },
      });

      if (!resetToken) {
        sendError(res, { status: 400, code: 'INVALID_RESET_TOKEN', message: 'Invalid or expired reset token' });
        return;
      }

      if (resetToken.expiresAt < new Date()) {
        sendError(res, { status: 400, code: 'RESET_TOKEN_EXPIRED', message: 'Reset token has expired' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        }),
        prisma.refreshToken.deleteMany({
          where: { userId: resetToken.userId },
        }),
      ]);

      sendSuccess(res, { message: 'Password has been reset successfully' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Password reset failed' });
    }
  }
);

export default router;
