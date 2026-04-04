import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createPaymentIntent, refundPaymentIntent, createTransfer } from '../lib/stripe';
import { sendPushNotification } from '../lib/notifications';

const router = Router();

const SPARK_MONTHLY_LIMIT = 5;
const VENDOR_FEE_RATE = 0.05;
const CLIENT_FEE_RATE = 0.05;

// ─── Helpers ─────────────────────────────────────────────

function toCents(amount: number | Decimal): number {
  return Math.round(Number(amount) * 100);
}

async function getVendorMonthlyBookingCount(vendorId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.booking.count({
    where: {
      vendorId,
      createdAt: { gte: startOfMonth },
      status: { not: 'CANCELLED' },
    },
  });
}

async function assertBookingAccess(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vendor: { select: { userId: true } } },
  });

  if (!booking) return { error: 'BOOKING_NOT_FOUND' as const, booking: null };

  const isClient = booking.clientId === userId;
  const isVendor = booking.vendor.userId === userId;

  if (!isClient && !isVendor) return { error: 'FORBIDDEN' as const, booking: null };

  return { error: null, booking, isClient, isVendor };
}

// ─── POST /bookings ──────────────────────────────────────

router.post(
  '/',
  authenticate,
  [
    body('vendorId').notEmpty().withMessage('Vendor ID is required'),
    body('eventDate').isISO8601().withMessage('Event date must be ISO 8601'),
    body('eventStartTime').isISO8601().withMessage('Start time must be ISO 8601'),
    body('eventEndTime').isISO8601().withMessage('End time must be ISO 8601'),
    body('eventLocation').trim().notEmpty().withMessage('Event location is required'),
    body('eventType').trim().notEmpty().withMessage('Event type is required'),
    body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be positive'),
    body('specialRequirements').optional().trim(),
    body('totalAmount').isFloat({ min: 1 }).withMessage('Total amount must be at least $1'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const clientId = req.user!.userId;
      const {
        vendorId, eventDate, eventStartTime, eventEndTime,
        eventLocation, eventType, guestCount, specialRequirements, totalAmount,
      } = req.body;

      // Verify vendor exists and is active
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        include: { user: true },
      });

      if (!vendor || !vendor.isActive) {
        sendError(res, { status: 404, code: 'VENDOR_NOT_FOUND', message: 'Vendor not found or inactive' });
        return;
      }

      // Check Spark tier booking limit
      if (vendor.subscriptionTier === 'SPARK') {
        const monthlyCount = await getVendorMonthlyBookingCount(vendorId);
        if (monthlyCount >= SPARK_MONTHLY_LIMIT) {
          sendError(res, {
            status: 409,
            code: 'VENDOR_BOOKING_LIMIT',
            message: 'This vendor has reached their monthly booking limit. Try again next month.',
          });
          return;
        }
      }

      // Calculate fees
      const total = parseFloat(totalAmount);
      const vendorFee = parseFloat((total * VENDOR_FEE_RATE).toFixed(2));
      const clientFee = parseFloat((total * CLIENT_FEE_RATE).toFixed(2));
      const platformRevenue = parseFloat((vendorFee + clientFee).toFixed(2));
      const chargeAmount = total + clientFee;

      // Create Stripe PaymentIntent
      const paymentIntent = await createPaymentIntent(toCents(chargeAmount), {
        vendorId,
        clientId,
        type: 'booking',
      });

      // Create booking + payment in a transaction
      const booking = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            clientId,
            vendorId,
            eventDate: new Date(eventDate),
            eventStartTime: new Date(eventStartTime),
            eventEndTime: new Date(eventEndTime),
            eventLocation,
            eventType,
            guestCount: guestCount ? parseInt(guestCount) : null,
            specialRequirements: specialRequirements || null,
            totalAmount: total,
            vendorFee,
            clientFee,
            platformRevenue,
          },
        });

        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            stripePaymentIntentId: paymentIntent.id,
            amount: chargeAmount,
            vendorPayout: parseFloat((total - vendorFee).toFixed(2)),
            platformFee: platformRevenue,
          },
        });

        return newBooking;
      });

      // Notify vendor
      await sendPushNotification(
        vendor.userId,
        'New Booking Request',
        `You have a new ${eventType} booking request for ${new Date(eventDate).toLocaleDateString()}`,
        { bookingId: booking.id }
      );

      sendSuccess(res, {
        booking,
        clientSecret: paymentIntent.client_secret,
      }, 201);
    } catch (err) {
      console.error('Create booking error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to create booking' });
    }
  }
);

// ─── POST /bookings/:bookingId/confirm ───────────────────

router.post(
  '/:bookingId/confirm',
  authenticate,
  [param('bookingId').notEmpty()],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { error, booking, isVendor } = await assertBookingAccess(
        req.params.bookingId as string, req.user!.userId
      );

      if (error === 'BOOKING_NOT_FOUND') {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }
      if (error === 'FORBIDDEN' || !isVendor) {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Only the vendor can confirm bookings' });
        return;
      }
      if (booking!.status !== 'PENDING') {
        sendError(res, { status: 409, code: 'INVALID_STATUS', message: `Cannot confirm a ${booking!.status} booking` });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id: booking!.id },
        data: { status: 'CONFIRMED' },
      });

      await sendPushNotification(
        booking!.clientId,
        'Booking Confirmed!',
        `Your ${booking!.eventType} booking has been confirmed.`,
        { bookingId: booking!.id }
      );

      sendSuccess(res, updated);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to confirm booking' });
    }
  }
);

// ─── POST /bookings/:bookingId/cancel ────────────────────

router.post(
  '/:bookingId/cancel',
  authenticate,
  [
    param('bookingId').notEmpty(),
    body('reason').optional().trim(),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { error, booking } = await assertBookingAccess(
        req.params.bookingId as string, req.user!.userId
      );

      if (error === 'BOOKING_NOT_FOUND') {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }
      if (error === 'FORBIDDEN') {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized' });
        return;
      }
      if (booking!.status === 'CANCELLED' || booking!.status === 'COMPLETED') {
        sendError(res, { status: 409, code: 'INVALID_STATUS', message: `Cannot cancel a ${booking!.status} booking` });
        return;
      }

      // Determine refund amount based on 48-hour window
      const payment = await prisma.payment.findUnique({ where: { bookingId: booking!.id } });
      let refundType: 'full' | 'partial' = 'full';

      if (payment?.stripePaymentIntentId) {
        const hoursUntilEvent = (new Date(booking!.eventDate).getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursUntilEvent < 48) {
          refundType = 'partial';
          const partialAmount = Math.round(toCents(Number(payment.amount)) * 0.5);
          await refundPaymentIntent(payment.stripePaymentIntentId, partialAmount);
        } else {
          await refundPaymentIntent(payment.stripePaymentIntentId);
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      const updated = await prisma.booking.update({
        where: { id: booking!.id },
        data: { status: 'CANCELLED' },
      });

      // Notify the other party
      const otherUserId = booking!.clientId === req.user!.userId
        ? (await prisma.vendorProfile.findUnique({ where: { id: booking!.vendorId } }))!.userId
        : booking!.clientId;

      await sendPushNotification(
        otherUserId,
        'Booking Cancelled',
        `A ${booking!.eventType} booking has been cancelled. ${refundType === 'partial' ? '50% refund issued.' : 'Full refund issued.'}`,
        { bookingId: booking!.id }
      );

      sendSuccess(res, { ...updated, refundType });
    } catch (err) {
      console.error('Cancel booking error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to cancel booking' });
    }
  }
);

// ─── POST /bookings/:bookingId/complete ──────────────────

router.post(
  '/:bookingId/complete',
  authenticate,
  [param('bookingId').notEmpty()],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { error, booking, isVendor } = await assertBookingAccess(
        req.params.bookingId as string, req.user!.userId
      );

      if (error === 'BOOKING_NOT_FOUND') {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }
      if (error === 'FORBIDDEN' || !isVendor) {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Only the vendor can complete bookings' });
        return;
      }
      if (booking!.status !== 'CONFIRMED') {
        sendError(res, { status: 409, code: 'INVALID_STATUS', message: `Cannot complete a ${booking!.status} booking` });
        return;
      }

      // Payout to vendor via Stripe Connect
      const payment = await prisma.payment.findUnique({ where: { bookingId: booking!.id } });
      const vendor = await prisma.vendorProfile.findUnique({ where: { id: booking!.vendorId } });

      if (payment) {
        // TODO: Get vendor's Stripe Connect account ID from their profile
        const vendorStripeAccountId = `acct_placeholder_${vendor!.id}`;

        try {
          await createTransfer(
            toCents(Number(payment.vendorPayout)),
            vendorStripeAccountId,
            { bookingId: booking!.id, type: 'vendor_payout' }
          );
        } catch (transferErr) {
          console.error('Stripe transfer failed (continuing):', transferErr);
          // Don't block completion if transfer fails — handle via reconciliation
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' },
        });
      }

      // Update booking status and vendor stats
      const updated = await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking!.id },
          data: { status: 'COMPLETED' },
        }),
        prisma.vendorProfile.update({
          where: { id: booking!.vendorId },
          data: { totalBookings: { increment: 1 } },
        }),
      ]);

      // Notify client to leave a review
      await sendPushNotification(
        booking!.clientId,
        'How was your experience?',
        `Your ${booking!.eventType} event is complete! Leave a review for ${vendor!.businessName}.`,
        { bookingId: booking!.id, action: 'review' }
      );

      sendSuccess(res, updated[0]);
    } catch (err) {
      console.error('Complete booking error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to complete booking' });
    }
  }
);

// ─── GET /bookings ───────────────────────────────────────

router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
    query('page').optional().isInt({ min: 1 }),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userType = req.user!.userType;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 20;
      const skip = (page - 1) * perPage;

      const where: any = {};

      if (req.query.status) {
        where.status = req.query.status as string;
      }

      if (userType === 'VENDOR') {
        const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
        if (!profile) {
          sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
          return;
        }
        where.vendorId = profile.id;
      } else {
        where.clientId = userId;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            client: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
            vendor: { select: { id: true, businessName: true, coverPhoto: true, user: { select: { firstName: true, lastName: true } } } },
            payment: { select: { status: true, amount: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.booking.count({ where }),
      ]);

      sendSuccess(res, bookings, 200, {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' });
    }
  }
);

// ─── GET /bookings/:bookingId ────────────────────────────

router.get(
  '/:bookingId',
  authenticate,
  [param('bookingId').notEmpty()],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { error } = await assertBookingAccess(req.params.bookingId as string, req.user!.userId);

      if (error === 'BOOKING_NOT_FOUND') {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }
      if (error === 'FORBIDDEN') {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized to view this booking' });
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id: req.params.bookingId as string },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, profilePhoto: true } },
          vendor: {
            select: {
              id: true, businessName: true, coverPhoto: true, category: true, city: true, state: true,
              user: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
            },
          },
          payment: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, firstName: true, profilePhoto: true } },
            },
          },
          review: true,
        },
      });

      sendSuccess(res, booking);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch booking' });
    }
  }
);

export default router;
