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

// Temporary seed endpoint — remove after seeding production
app.get('/seed-database', async (_req, res) => {
  try {
    const bcrypt = require('bcryptjs');

    const count = await prisma.user.count();
    if (count > 0) {
      return res.json({ status: 'ok', message: 'Database already has ' + count + ' users. Skipping seed.' });
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
      const user = await prisma.user.create({
        data: {
          email: 'vendor' + (i + 1) + '@connectme-demo.com',
          passwordHash: PASSWORD_HASH,
          firstName: names[i]?.split(' ')[0] || 'Vendor',
          lastName: names[i]?.split(' ').slice(1).join(' ') || String(i + 1),
          phone: '(210) 555-' + String(1000 + i),
          profilePhoto: 'https://i.pravatar.cc/200?u=vendor' + i,
          userType: 'VENDOR',
          isVerified: i % 3 === 0,
        },
      });
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: names[i] || 'SA Vendor ' + (i + 1),
          category: cat as any,
          bio: 'Premier ' + cat.toLowerCase().replace(/_/g, ' ') + ' service in the San Antonio area. Bringing unforgettable experiences to your events since 2020.',
          basePrice: 150 + (i * 50),
          priceUnit: i % 3 === 0 ? 'PER_HOUR' : 'PER_EVENT',
          city,
          state: 'TX',
          serviceRadius: 25 + (i * 5),
          coverPhoto: 'https://picsum.photos/seed/vendor' + i + '/800/600',
          portfolioPhotos: ['https://picsum.photos/seed/v' + i + 'a/800/600', 'https://picsum.photos/seed/v' + i + 'b/800/600', 'https://picsum.photos/seed/v' + i + 'c/800/600'],
          averageRating: 3.5 + (Math.random() * 1.5),
          totalReviews: 5 + Math.floor(Math.random() * 50),
          totalBookings: 10 + Math.floor(Math.random() * 80),
          subscriptionTier: 'SPARK',
        },
      });
    }

    for (let i = 0; i < 5; i++) {
      await prisma.user.create({
        data: {
          email: 'client' + (i + 1) + '@connectme-demo.com',
          passwordHash: PASSWORD_HASH,
          firstName: ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'][i],
          lastName: ['Johnson', 'Williams', 'Brown', 'Garcia', 'Martinez'][i],
          phone: '(210) 555-' + String(2000 + i),
          profilePhoto: 'https://i.pravatar.cc/200?u=client' + i,
          userType: 'CLIENT',
        },
      });
    }

    res.json({ status: 'ok', message: 'Database seeded with 20 vendors and 5 clients. Password: demo1234' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Seed bookings, reviews, and messages for existing vendors/clients
app.get('/seed-demo-data', async (_req, res) => {
  try {
    const bookingCount = await prisma.booking.count();
    if (bookingCount > 0) {
      return res.json({ status: 'ok', message: 'Demo data already exists. ' + bookingCount + ' bookings found.' });
    }

    const vendors = await prisma.vendorProfile.findMany({ include: { user: true } });
    const clients = await prisma.user.findMany({ where: { userType: 'CLIENT' } });

    if (vendors.length === 0 || clients.length === 0) {
      return res.json({ status: 'error', message: 'No vendors or clients found. Run /seed-database first.' });
    }

    const eventTypes = ['Wedding', 'Birthday Party', 'Corporate Event', 'Graduation', 'Anniversary', 'Holiday Party', 'Baby Shower', 'Reunion'];
    const locations = ['Pearl District, San Antonio', 'Riverwalk, San Antonio', 'Alamo Heights, San Antonio', 'Stone Oak, San Antonio', 'Downtown, San Antonio', 'La Cantera, San Antonio'];
    const reviewComments = [
      'Absolutely amazing service! They made our event unforgettable. Highly recommend to anyone looking for top-quality vendors.',
      'Professional, punctual, and exceeded our expectations. The team was friendly and accommodating throughout.',
      'Great experience from start to finish. Communication was excellent and they delivered exactly what was promised.',
      'We were blown away by the quality. Our guests are still talking about how great everything was!',
      'Fantastic vendor! They went above and beyond to make our special day perfect. Worth every penny.',
      'Very impressed with their attention to detail. They truly care about their clients and it shows.',
      'Good service overall. A few minor hiccups but they handled everything professionally.',
      'Outstanding! They transformed our venue into something magical. Cannot recommend enough.',
      'Reliable, creative, and fun to work with. They brought so much energy to our celebration.',
      'Top-notch service. They were flexible with our last-minute changes and still delivered perfectly.',
      'The best decision we made for our event. Quality was exceptional and pricing was fair.',
      'Such a wonderful team to work with. They made the planning process stress-free and enjoyable.',
    ];
    const vendorResponses = [
      'Thank you so much for the kind words! We loved being part of your celebration.',
      'It was our pleasure! Your event was truly special and we enjoyed every moment.',
      'We appreciate your wonderful feedback! Looking forward to working with you again.',
      null, null, null,
    ];
    const messageTemplates = [
      ['Hi! I am interested in booking you for my upcoming event.', 'Thank you for reaching out! I would love to help. What date are you looking at?'],
      ['Do you have availability on the date I selected?', 'Yes, that date works perfectly! Let me send you some details about our packages.'],
      ['What is included in your standard package?', 'Our standard package includes 4 hours of service, setup and teardown, and all equipment. Would you like to add any extras?'],
      ['That sounds great! How do I confirm the booking?', 'Just click the Book Now button on my profile and fill in your event details. I will confirm within 24 hours!'],
      ['Thank you for confirming! Looking forward to the event.', 'Me too! Do not hesitate to reach out if you need anything before the big day.'],
    ];

    let bookingsCreated = 0;
    let reviewsCreated = 0;
    let messagesCreated = 0;

    for (let v = 0; v < vendors.length; v++) {
      const vendor = vendors[v];
      const numBookings = 3 + (v % 4);

      for (let b = 0; b < numBookings; b++) {
        const client = clients[b % clients.length];
        const daysAgo = 5 + (b * 15) + (v * 3);
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);
        const startTime = new Date(eventDate);
        startTime.setHours(14 + (b % 4), 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 3);

        const basePrice = Number(vendor.basePrice);
        const clientFee = basePrice * 0.05;
        const vendorFee = basePrice * 0.03;
        const totalAmount = basePrice + clientFee;
        const platformRevenue = clientFee + vendorFee;

        const isCompleted = b < numBookings - 1;
        const status = isCompleted ? 'COMPLETED' : (b % 3 === 0 ? 'CONFIRMED' : 'PENDING');

        const booking = await prisma.booking.create({
          data: {
            clientId: client.id,
            vendorId: vendor.id,
            eventDate: eventDate,
            eventStartTime: startTime,
            eventEndTime: endTime,
            eventLocation: locations[(v + b) % locations.length],
            eventType: eventTypes[(v + b) % eventTypes.length],
            guestCount: 20 + (b * 15) + (v * 5),
            specialRequirements: b % 3 === 0 ? 'Please arrive 30 minutes early for setup.' : null,
            status: status as any,
            totalAmount: totalAmount,
            vendorFee: vendorFee,
            clientFee: clientFee,
            platformRevenue: platformRevenue,
          },
        });
        bookingsCreated++;

        // Create review for completed bookings
        if (isCompleted && b < reviewComments.length) {
          const rating = 3 + Math.floor(Math.random() * 3);
          await prisma.review.create({
            data: {
              bookingId: booking.id,
              clientId: client.id,
              vendorId: vendor.user.id,
              rating: rating,
              comment: reviewComments[(v + b) % reviewComments.length],
              vendorResponse: vendorResponses[(v + b) % vendorResponses.length],
            },
          });
          reviewsCreated++;
        }

        // Create messages for each booking
        const numMessages = 2 + (b % 3);
        for (let m = 0; m < numMessages && m < messageTemplates.length; m++) {
          const msgTime = new Date(eventDate);
          msgTime.setDate(msgTime.getDate() - 7 + m);
          msgTime.setHours(9 + m * 2);

          await prisma.message.create({
            data: {
              bookingId: booking.id,
              senderId: client.id,
              receiverId: vendor.user.id,
              content: messageTemplates[m][0],
              isRead: true,
              createdAt: msgTime,
            },
          });
          messagesCreated++;

          const replyTime = new Date(msgTime);
          replyTime.setHours(replyTime.getHours() + 1);
          await prisma.message.create({
            data: {
              bookingId: booking.id,
              senderId: vendor.user.id,
              receiverId: client.id,
              content: messageTemplates[m][1],
              isRead: true,
              createdAt: replyTime,
            },
          });
          messagesCreated++;
        }
      }
    }

    res.json({
      status: 'ok',
      message: 'Demo data seeded: ' + bookingsCreated + ' bookings, ' + reviewsCreated + ' reviews, ' + messagesCreated + ' messages.',
    });
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
