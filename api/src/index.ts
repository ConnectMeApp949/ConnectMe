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

// Temporary: fix vendor photos and categories
app.get('/fix-vendors-final', async (_req, res) => {
  try {
    const vendorFixes: Record<string, { category: string; cover: string; portfolio: string[] }> = {
      'Taco Libre SA': { category: 'FOOD_TRUCK', cover: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1567129937968-cdad27f04d07?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1540914124281-342587941389?w=800&h=600&fit=crop'] },
      'SA Bridal Dreams': { category: 'WEDDING_SERVICES', cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop'] },
      'SA Rolling Kitchen': { category: 'FOOD_TRUCK', cover: 'https://images.unsplash.com/photo-1567129937968-cdad27f04d07?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=600&fit=crop'] },
      'SA Soundwave': { category: 'DJ', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1571266028243-3716f02d2d1e?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop'] },
      'Riverwalk Captures': { category: 'PHOTOGRAPHY', cover: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop'] },
      'Alamo City Bites': { category: 'FOOD_TRUCK', cover: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop'] },
      'Fiesta Flavors': { category: 'CATERING', cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1432139509613-5c4255a78e03?w=800&h=600&fit=crop'] },
      'DJ Alamo Beats': { category: 'DJ', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop'] },
      'Riverwalk Rhythms': { category: 'DJ', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'] },
      'Lone Star DJ Co': { category: 'DJ', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800&h=600&fit=crop'] },
      'Alamo Wedding Co': { category: 'WEDDING_SERVICES', cover: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800&h=600&fit=crop'] },
      'Alamo City Catering': { category: 'CATERING', cover: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop'] },
      'Pearl District Eats': { category: 'CATERING', cover: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'] },
      'Mission City Cuisine': { category: 'CATERING', cover: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'] },
      'Fiesta Entertainment Co': { category: 'ENTERTAINMENT', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop'] },
      'SA Party Pros': { category: 'ENTERTAINMENT', cover: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'] },
      'Mission City Weddings': { category: 'WEDDING_SERVICES', cover: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1470290378698-263fa7ca60ab?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&h=600&fit=crop'] },
      'Alamo Moments Photography': { category: 'PHOTOGRAPHY', cover: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=800&h=600&fit=crop'] },
      'SA Forever Photos': { category: 'PHOTOGRAPHY', cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&h=600&fit=crop'] },
      'Lone Star Events': { category: 'ENTERTAINMENT', cover: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop', portfolio: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop'] },
    };
    let updated = 0;
    for (const [name, fix] of Object.entries(vendorFixes)) {
      const vendor = await prisma.vendorProfile.findFirst({ where: { businessName: name } });
      if (vendor) {
        await prisma.vendorProfile.update({
          where: { id: vendor.id },
          data: { category: fix.category as any, coverPhoto: fix.cover, portfolioPhotos: fix.portfolio },
        });
        updated++;
      }
    }
    res.json({ status: 'ok', message: updated + ' vendors updated with unique photos and correct categories.' });
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
