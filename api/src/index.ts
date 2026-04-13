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
