import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { sendPushNotification } from '../lib/notifications';

const router = Router();

// ─── Multer for ID upload ────────────────────────────────
// TODO: Swap for S3 in production

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/verification');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `id-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ─── POST /verification/submit ───────────────────────────

router.post(
  '/submit',
  authenticate,
  upload.single('governmentId'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        sendError(res, { status: 400, code: 'NO_FILE', message: 'Government ID image is required' });
        return;
      }

      const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!vendor) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      // Check for existing pending submission
      const existing = await prisma.vendorVerification.findFirst({
        where: { vendorId: vendor.id, status: 'PENDING' },
      });
      if (existing) {
        sendError(res, { status: 409, code: 'PENDING_SUBMISSION', message: 'You already have a pending verification request' });
        return;
      }

      const { businessName, businessLicenseNumber } = req.body;
      if (!businessName?.trim()) {
        sendError(res, { status: 400, code: 'VALIDATION_ERROR', message: 'Business name is required' });
        return;
      }

      const verification = await prisma.vendorVerification.create({
        data: {
          vendorId: vendor.id,
          governmentIdUrl: `/uploads/verification/${file.filename}`,
          businessName: businessName.trim(),
          businessLicenseNumber: businessLicenseNumber?.trim() || null,
        },
      });

      sendSuccess(res, verification, 201);
    } catch (err) {
      console.error('Verification submit error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to submit verification' });
    }
  }
);

// ─── GET /verification/status ────────────────────────────

router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });

    if (!vendor) {
      sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
      return;
    }

    const latest = await prisma.vendorVerification.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    sendSuccess(res, {
      isVerified: user?.isVerified ?? false,
      latestSubmission: latest,
    });
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch verification status' });
  }
});

// ─── Admin endpoints ─────────────────────────────────────

// GET /verification/pending — list all pending verifications
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const verifications = await prisma.vendorVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        vendor: {
          select: {
            id: true, businessName: true, category: true, city: true, state: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    sendSuccess(res, verifications);
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch verifications' });
  }
});

// POST /verification/:id/approve
router.post(
  '/:id/approve',
  [param('id').notEmpty()],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const verification = await prisma.vendorVerification.findUnique({
        where: { id: req.params.id as string },
        include: { vendor: { select: { userId: true } } },
      });

      if (!verification) {
        sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Verification not found' });
        return;
      }

      await prisma.$transaction([
        prisma.vendorVerification.update({
          where: { id: verification.id },
          data: { status: 'APPROVED', reviewedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: verification.vendor.userId },
          data: { isVerified: true },
        }),
      ]);

      await sendPushNotification(
        verification.vendor.userId,
        'Verification Approved! ✓',
        'Your identity has been verified. You now have a blue verified badge on your profile.',
        { type: 'verification_approved' }
      );

      sendSuccess(res, { message: 'Vendor verified successfully' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to approve verification' });
    }
  }
);

// POST /verification/:id/reject
router.post(
  '/:id/reject',
  [
    param('id').notEmpty(),
    body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const verification = await prisma.vendorVerification.findUnique({
        where: { id: req.params.id as string },
        include: { vendor: { select: { userId: true } } },
      });

      if (!verification) {
        sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Verification not found' });
        return;
      }

      await prisma.vendorVerification.update({
        where: { id: verification.id },
        data: {
          status: 'REJECTED',
          rejectionReason: req.body.reason,
          reviewedAt: new Date(),
        },
      });

      await sendPushNotification(
        verification.vendor.userId,
        'Verification Update',
        'Your verification request needs attention. Please check your profile for details.',
        { type: 'verification_rejected' }
      );

      sendSuccess(res, { message: 'Verification rejected' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to reject verification' });
    }
  }
);

export default router;
