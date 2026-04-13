import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import vendorRoutes from './routes/vendors';
import bookingRoutes from './routes/bookings';
import messageRoutes from './routes/messages';
import reviewRoutes from './routes/reviews';
import subscriptionRoutes from './routes/subscriptions';
import webhookRoutes from './routes/webhooks';
import verificationRoutes from './routes/verification';
import { initializeSocket } from './lib/socket';
import notificationRoutes from './routes/notifications';
import { startAutoCompleteJob } from './jobs/auto-complete-bookings';
import { startEventReminderJob } from './jobs/event-reminders';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());

// Stripe webhooks need raw body — must be before express.json()
app.use('/webhooks', webhookRoutes);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Fix demo vendor photos to match their categories
app.get('/fix-vendor-photos', async (_req, res) => {
  try {
    const photoMap: Record<string, { cover: string; portfolio: string[] }> = {
      FOOD_TRUCK: {
        cover: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1567129937968-cdad27f04d07?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        ],
      },
      DJ: {
        cover: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d1e?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
        ],
      },
      CATERING: {
        cover: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop',
        ],
      },
      WEDDING_SERVICES: {
        cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop',
        ],
      },
      PHOTOGRAPHY: {
        cover: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&h=600&fit=crop',
        ],
      },
      ENTERTAINMENT: {
        cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        portfolio: [
          'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',
        ],
      },
    };

    const vendors = await prisma.vendorProfile.findMany();
    let updated = 0;
    for (const v of vendors) {
      const photos = photoMap[v.category];
      if (photos) {
        const idx = updated % 3;
        await prisma.vendorProfile.update({
          where: { id: v.id },
          data: {
            coverPhoto: photos.cover + '&sig=' + v.id.slice(0, 6),
            portfolioPhotos: photos.portfolio.map((p, i) => p + '&sig=' + v.id.slice(0, 6) + i),
          },
        });
        updated++;
      }
    }
    res.json({ status: 'ok', message: updated + ' vendors updated with category-matching photos.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Temporary endpoint to clear demo data — remove after use
app.get('/clear-demo-data', async (_req, res) => {
  try {
    await prisma.message.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.vendorProfile.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    res.json({ status: 'ok', message: 'All demo data cleared. Database is clean for launch.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/auth', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/bookings', bookingRoutes);
app.use('/messages', messageRoutes);
app.use('/reviews', reviewRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/notifications', notificationRoutes);
app.use('/verification', verificationRoutes);

// Initialize Socket.io
initializeSocket(httpServer);

// Start scheduled jobs
startAutoCompleteJob();
startEventReminderJob();

httpServer.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
