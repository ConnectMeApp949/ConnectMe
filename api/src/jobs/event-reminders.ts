import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendPushNotification } from '../lib/notifications';

export function startEventReminderJob(): void {
  // Run every hour at :00
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running event reminder job...');

    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find confirmed bookings happening in the next 24-25 hours
      const upcoming = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          eventDate: { gte: in24h, lt: in25h },
        },
        include: {
          client: { select: { id: true, firstName: true } },
          vendor: { select: { userId: true, businessName: true } },
        },
      });

      console.log(`[CRON] Found ${upcoming.length} events to remind about`);

      for (const booking of upcoming) {
        const dateStr = new Date(booking.eventDate).toLocaleDateString('en-US', {
          weekday: 'long', month: 'short', day: 'numeric',
        });

        // Remind client
        await sendPushNotification(
          booking.clientId,
          'Event Tomorrow!',
          `Your ${booking.eventType} with ${booking.vendor.businessName} is tomorrow, ${dateStr}.`,
          { bookingId: booking.id, type: 'event_reminder' }
        );

        // Remind vendor
        await sendPushNotification(
          booking.vendor.userId,
          'Event Tomorrow!',
          `Your ${booking.eventType} event for ${booking.client.firstName} is tomorrow, ${dateStr}.`,
          { bookingId: booking.id, type: 'event_reminder' }
        );
      }
    } catch (err) {
      console.error('[CRON] Event reminder error:', err);
    }
  });

  console.log('[CRON] Event reminder job scheduled (hourly)');
}
