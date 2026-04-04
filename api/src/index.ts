import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Temporary seed endpoint — remove after seeding production
app.get('/seed-database', async (_req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const p = new PrismaClient();

    // Check if already seeded
    const count = await p.user.count();
    if (count > 0) {
      await p.$disconnect();
      return res.json({ status: 'ok', message: `Database already has ${count} users. Skipping seed.` });
    }

    const PASSWORD_HASH = await bcrypt.hash('demo1234', 10);
    const categories = ['FOOD_TRUCK', 'DJ', 'CATERING', 'WEDDING_SERVICES', 'PHOTOGRAPHY', 'ENTERTAINMENT'];
    const cities = ['San Antonio', 'Alamo Heights', 'Stone Oak', 'Helotes', 'Boerne'];
    const names = [
      'Taco Libre SA', 'Alamo City Bites', 'SA Rolling Kitchen', 'Fiesta Flavors',
      'DJ Alamo Beats', 'Riverwalk Rhythms', 'SA Soundwave', 'Lone Star DJ Co',
      'Alamo City Catering', 'Pearl District Eats', 'Mission City Cuisine',
      'SA Forever Photos', 'Riverwalk Captures', 'Alamo Moments Photography',
      'Fiesta Entertainment Co', 'SA Party Pros', 'Lone Star Events',
      'Mission City Weddings', 'SA Bridal Dreams', 'Alamo Wedding Co',
    ];

    for (let i = 0; i < 20; i++) {
      const cat = categories[i % categories.length];
      const city = cities[i % cities.length];
      const user = await p.user.create({
        data: {
          email: \`vendor\${i + 1}@connectme-demo.com\`,
          passwordHash: PASSWORD_HASH,
          firstName: names[i]?.split(' ')[0] || 'Vendor',
          lastName: names[i]?.split(' ').slice(1).join(' ') || \`\${i + 1}\`,
          phone: \`(210) 555-\${String(1000 + i)}\`,
          profilePhoto: \`https://i.pravatar.cc/200?u=vendor\${i}\`,
          userType: 'VENDOR',
          isVerified: i % 3 === 0,
        },
      });
      await p.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: names[i] || \`SA Vendor \${i + 1}\`,
          category: cat as any,
          bio: \`Premier \${cat.toLowerCase().replace(/_/g, ' ')} service in the San Antonio area. Bringing unforgettable experiences to your events since 2020.\`,
          basePrice: 150 + (i * 50),
          priceUnit: i % 3 === 0 ? 'PER_HOUR' : 'PER_EVENT',
          city,
          state: 'TX',
          serviceRadius: 25 + (i * 5),
          coverPhoto: \`https://picsum.photos/seed/vendor\${i}/800/600\`,
          portfolioPhotos: [\`https://picsum.photos/seed/v\${i}a/800/600\`, \`https://picsum.photos/seed/v\${i}b/800/600\`, \`https://picsum.photos/seed/v\${i}c/800/600\`],
          averageRating: 3.5 + (Math.random() * 1.5),
          totalReviews: 5 + Math.floor(Math.random() * 50),
          totalBookings: 10 + Math.floor(Math.random() * 80),
          subscriptionTier: 'SPARK',
        },
      });
    }

    // Create demo client users
    for (let i = 0; i < 5; i++) {
      await p.user.create({
        data: {
          email: \`client\${i + 1}@connectme-demo.com\`,
          passwordHash: PASSWORD_HASH,
          firstName: ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'][i],
          lastName: ['Johnson', 'Williams', 'Brown', 'Garcia', 'Martinez'][i],
          phone: \`(210) 555-\${String(2000 + i)}\`,
          profilePhoto: \`https://i.pravatar.cc/200?u=client\${i}\`,
          userType: 'CLIENT',
        },
      });
    }

    await p.$disconnect();
    res.json({ status: 'ok', message: 'Database seeded with 20 vendors and 5 clients. Password: demo1234' });
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
