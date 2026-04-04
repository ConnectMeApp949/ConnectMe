import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import prisma from '../lib/prisma';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────

async function recalculateVendorRating(vendorProfileId: string): Promise<void> {
  const stats = await prisma.review.aggregate({
    where: { booking: { vendorId: vendorProfileId } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      totalReviews: stats._count.rating,
    },
  });
}

// ─── POST /reviews ───────────────────────────────────────

router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be 1000 chars or less'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const clientId = req.user!.userId;
      const { bookingId, rating, comment } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { review: true, vendor: { select: { id: true, userId: true } } },
      });

      if (!booking) {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }

      if (booking.clientId !== clientId) {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Only the client can review a booking' });
        return;
      }

      if (booking.status !== 'COMPLETED') {
        sendError(res, { status: 409, code: 'BOOKING_NOT_COMPLETED', message: 'Can only review completed bookings' });
        return;
      }

      if (booking.review) {
        sendError(res, { status: 409, code: 'REVIEW_EXISTS', message: 'A review already exists for this booking' });
        return;
      }

      const review = await prisma.review.create({
        data: {
          bookingId,
          clientId,
          vendorId: booking.vendor.userId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          client: { select: { firstName: true, profilePhoto: true } },
        },
      });

      await recalculateVendorRating(booking.vendorId);

      sendSuccess(res, review, 201);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to submit review' });
    }
  }
);

// ─── PUT /reviews/:reviewId/response ─────────────────────

router.put(
  '/:reviewId/response',
  authenticate,
  [
    param('reviewId').notEmpty(),
    body('response').trim().notEmpty().withMessage('Response is required')
      .isLength({ max: 500 }).withMessage('Response must be 500 chars or less'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const reviewId = req.params.reviewId as string;
      const vendorUserId = req.user!.userId;

      const review = await prisma.review.findUnique({ where: { id: reviewId } });

      if (!review) {
        sendError(res, { status: 404, code: 'REVIEW_NOT_FOUND', message: 'Review not found' });
        return;
      }

      if (review.vendorId !== vendorUserId) {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Only the reviewed vendor can respond' });
        return;
      }

      if (review.vendorResponse) {
        sendError(res, { status: 409, code: 'RESPONSE_EXISTS', message: 'A response has already been submitted and cannot be edited' });
        return;
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { vendorResponse: req.body.response },
      });

      sendSuccess(res, updated);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to submit response' });
    }
  }
);

// ─── GET /reviews/vendor/:vendorId ───────────────────────

router.get(
  '/vendor/:vendorId',
  [
    param('vendorId').notEmpty(),
    query('sort').optional().isIn(['newest', 'highest', 'lowest']),
    query('rating').optional().isInt({ min: 1, max: 5 }),
    query('page').optional().isInt({ min: 1 }),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const vendorId = req.params.vendorId as string;
      const sort = (req.query.sort as string) || 'newest';
      const filterRating = req.query.rating ? parseInt(req.query.rating as string) : null;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 20;
      const skip = (page - 1) * perPage;

      // Get vendor profile to find the user ID used in reviews
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        select: { userId: true, averageRating: true, totalReviews: true },
      });

      if (!vendor) {
        sendError(res, { status: 404, code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' });
        return;
      }

      const where: any = { vendorId: vendor.userId };
      if (filterRating) {
        if (filterRating <= 3) {
          where.rating = { lte: 3 };
        } else {
          where.rating = filterRating;
        }
      }

      const orderBy: any = sort === 'highest'
        ? { rating: 'desc' }
        : sort === 'lowest'
          ? { rating: 'asc' }
          : { createdAt: 'desc' };

      // Rating distribution
      const distribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { vendorId: vendor.userId },
        _count: { rating: true },
      });

      const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      distribution.forEach((d) => { ratingBreakdown[d.rating] = d._count.rating; });

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          include: {
            client: { select: { firstName: true, profilePhoto: true } },
          },
          orderBy,
          skip,
          take: perPage,
        }),
        prisma.review.count({ where }),
      ]);

      const formatted = reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        vendorResponse: r.vendorResponse,
        createdAt: r.createdAt.toISOString(),
        client: {
          firstName: r.client.firstName,
          avatarInitial: r.client.firstName[0],
          profilePhoto: r.client.profilePhoto,
        },
      }));

      sendSuccess(res, {
        averageRating: Number(vendor.averageRating),
        totalReviews: vendor.totalReviews,
        ratingBreakdown,
        reviews: formatted,
      }, 200, {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' });
    }
  }
);

export default router;
