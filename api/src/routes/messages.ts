import { Router, Request, Response } from 'express';
import { param, query } from 'express-validator';
import prisma from '../lib/prisma';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// ─── GET /messages/:bookingId ────────────────────────────

router.get(
  '/:bookingId',
  authenticate,
  [
    param('bookingId').notEmpty(),
    query('page').optional().isInt({ min: 1 }),
    query('before').optional().isISO8601(),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const bookingId = req.params.bookingId as string;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 50;
      const skip = (page - 1) * perPage;

      // Verify access
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { vendor: { select: { userId: true } } },
      });

      if (!booking) {
        sendError(res, { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
        return;
      }

      const isClient = booking.clientId === userId;
      const isVendor = booking.vendor.userId === userId;

      if (!isClient && !isVendor) {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized' });
        return;
      }

      const where: any = { bookingId };

      // Cursor-based filtering for real-time sync
      if (req.query.before) {
        where.createdAt = { lt: new Date(req.query.before as string) };
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            sender: { select: { id: true, firstName: true, profilePhoto: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.message.count({ where: { bookingId } }),
      ]);

      const formatted = messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.firstName,
        senderAvatar: m.sender.profilePhoto,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        isRead: m.isRead,
      }));

      sendSuccess(res, formatted, 200, {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch messages' });
    }
  }
);

// ─── GET /messages/conversations ─────────────────────────

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userType = req.user!.userType;

      // Find all bookings for this user that have messages
      const where: any = {};
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

      const bookings = await prisma.booking.findMany({
        where: {
          ...where,
          messages: { some: {} },
        },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
          vendor: {
            select: {
              id: true, businessName: true, coverPhoto: true,
              user: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: { select: { firstName: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Get unread counts
      const conversations = await Promise.all(
        bookings.map(async (b) => {
          const unreadCount = await prisma.message.count({
            where: { bookingId: b.id, receiverId: userId, isRead: false },
          });

          const lastMessage = b.messages[0];
          const otherParty = userType === 'VENDOR'
            ? { name: `${b.client.firstName} ${b.client.lastName}`, avatar: b.client.profilePhoto }
            : { name: b.vendor.businessName, avatar: b.vendor.coverPhoto };

          return {
            bookingId: b.id,
            bookingStatus: b.status,
            eventType: b.eventType,
            eventDate: b.eventDate.toISOString(),
            otherParty,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  senderName: lastMessage.sender.firstName,
                  createdAt: lastMessage.createdAt.toISOString(),
                }
              : null,
            unreadCount,
          };
        })
      );

      sendSuccess(res, conversations);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch conversations' });
    }
  }
);

export default router;
