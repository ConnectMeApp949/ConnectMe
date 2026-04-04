import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendPushNotification } from '../lib/notifications';

export function startAutoCompleteJob(): void {
  // Run every night at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running auto-complete bookings job...');

    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const staleBookings = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          eventDate: { lt: cutoff },
        },
        include: {
          vendor: { select: { id: true, userId: true, businessName: true } },
          payment: true,
        },
      });

      console.log(`[CRON] Found ${staleBookings.length} bookings to auto-complete`);

      for (const booking of staleBookings) {
        try {
          await prisma.$transaction([
            prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'COMPLETED' },
            }),
            prisma.vendorProfile.update({
              where: { id: booking.vendorId },
              data: { totalBookings: { increment: 1 } },
            }),
            ...(booking.payment
              ? [prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'COMPLETED' } })]
              : []),
          ]);

          // Prompt client for review
          await sendPushNotification(
            booking.clientId,
            'How was your experience?',
            `Your ${booking.eventType} event with ${booking.vendor.businessName} is complete! Leave a review.`,
            { bookingId: booking.id, action: 'review' }
          );

          console.log(`[CRON] Auto-completed booking ${booking.id}`);
        } catch (err) {
          console.error(`[CRON] Failed to auto-complete booking ${booking.id}:`, err);
        }
      }

      console.log('[CRON] Auto-complete job finished');
    } catch (err) {
      console.error('[CRON] Auto-complete job error:', err);
    }
  });

  console.log('[CRON] Auto-complete bookings job scheduled (daily at 2:00 AM)');
}
