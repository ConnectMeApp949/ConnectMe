import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../lib/prisma';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// ─── POST /notifications/register-token ──────────────────

router.post(
  '/register-token',
  authenticate,
  [body('token').notEmpty().withMessage('Push token is required')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { pushToken: req.body.token },
      });

      sendSuccess(res, { message: 'Push token registered' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to register push token' });
    }
  }
);

export default router;
