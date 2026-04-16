import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
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
import { requireApiKey } from './middleware/api-key';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());

// ─── Rate limiting ──────────────────────────────────────
// General: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
});

// Auth: stricter — 10 requests per minute per IP (login, register)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, please try again later.' } },
});

app.use(generalLimiter);

// Stripe webhooks need raw body — must be before express.json()
app.use('/webhooks', webhookRoutes);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ─── API key validation (applied after webhooks/health) ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(requireApiKey);

app.use('/auth', authLimiter, authRoutes);
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
