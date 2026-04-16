import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, generateResetToken, hashResetToken } from '../lib/tokens';
import { sendError, sendSuccess } from '../lib/errors';
import { sendPasswordResetEmail } from '../lib/mail';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

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
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profilePhoto: user.profilePhoto, phone: user.phone, userType: user.userType, isVerified: user.isVerified },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Login failed' });
    }
  }
);

// ─── GET /auth/me ────────────────────────────────────────

router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'User not found' });
      }
      sendSuccess(res, {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profilePhoto: user.profilePhoto, phone: user.phone, userType: user.userType, isVerified: user.isVerified },
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' });
    }
  }
);

// ─── POST /auth/social-login ─────────────────────────────

router.post(
  '/social-login',
  [
    body('provider').isIn(['facebook', 'google', 'apple']).withMessage('Valid provider is required'),
    body('accessToken').notEmpty().withMessage('Access token is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { provider, accessToken } = req.body;
      let email: string | null = null;
      let firstName = '';
      let lastName = '';
      let profilePhoto: string | null = null;

      if (provider === 'facebook') {
        const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture.type(large)&access_token=${accessToken}`);
        const fbData: any = await fbRes.json();
        if (fbData.error) {
          return sendError(res, { status: 401, code: 'SOCIAL_AUTH_FAILED', message: 'Invalid Facebook token' });
        }
        email = fbData.email;
        firstName = fbData.first_name ?? '';
        lastName = fbData.last_name ?? '';
        profilePhoto = fbData.picture?.data?.url ?? null;
      } else if (provider === 'google') {
        const gRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const gData: any = await gRes.json();
        if (gData.error) {
          return sendError(res, { status: 401, code: 'SOCIAL_AUTH_FAILED', message: 'Invalid Google token' });
        }
        email = gData.email;
        firstName = gData.given_name ?? '';
        lastName = gData.family_name ?? '';
        profilePhoto = gData.picture ?? null;
      } else {
        return sendError(res, { status: 400, code: 'UNSUPPORTED', message: 'Provider not supported for token exchange' });
      }

      if (!email) {
        return sendError(res, { status: 400, code: 'NO_EMAIL', message: 'Unable to retrieve email from provider' });
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: '', // social-only account, no password
            firstName,
            lastName,
            profilePhoto,
            userType: 'CLIENT',
          },
        });
      }

      const jwtToken = generateAccessToken({ userId: user.id, email: user.email, userType: user.userType });
      const { token: refreshToken, expiresAt } = generateRefreshToken();

      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt },
      });

      sendSuccess(res, {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profilePhoto: user.profilePhoto, userType: user.userType },
        accessToken: jwtToken,
        refreshToken,
      });
    } catch (err) {
      console.error('Social login error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Social login failed' });
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

// ─── DELETE /auth/delete-account ────────────────────────

router.delete(
  '/delete-account',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;

      // Find vendor profile if user is a vendor
      const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
      const vendorId = vendorProfile?.id;

      // Collect all booking IDs for this user (as client or vendor)
      const bookingFilter = vendorId
        ? { OR: [{ clientId: userId }, { vendorId }] }
        : { clientId: userId };

      // Delete all user data in correct order (respecting FK constraints)
      await prisma.$transaction([
        prisma.review.deleteMany({ where: { booking: bookingFilter } }),
        prisma.payment.deleteMany({ where: { booking: bookingFilter } }),
        prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { booking: bookingFilter }] } }),
        prisma.booking.deleteMany({ where: bookingFilter }),
        ...(vendorId ? [
          prisma.vendorVerification.deleteMany({ where: { vendorId } }),
          prisma.subscription.deleteMany({ where: { vendorId } }),
          prisma.vendorProfile.delete({ where: { userId } }),
        ] : []),
        prisma.refreshToken.deleteMany({ where: { userId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
      ]);

      sendSuccess(res, { message: 'Account deleted successfully' });
    } catch (err) {
      console.error('Account deletion error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to delete account. Please contact support.' });
    }
  }
);

export default router;
