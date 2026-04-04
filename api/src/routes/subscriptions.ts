import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../lib/prisma';
import stripe from '../lib/stripe';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe Price IDs — TODO: create these in Stripe Dashboard and move to env
const PRICE_IDS: Record<string, string> = {
  IGNITE: process.env.STRIPE_PRICE_IGNITE || 'price_ignite_placeholder',
  AMPLIFY: process.env.STRIPE_PRICE_AMPLIFY || 'price_amplify_placeholder',
};

const TIER_PRICES: Record<string, number> = { IGNITE: 49, AMPLIFY: 99 };

// ─── Helpers ─────────────────────────────────────────────

async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  // Check if user already has a Stripe customer ID stored
  // TODO: Add stripeCustomerId field to User model
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  return customer.id;
}

// ─── POST /subscriptions/create ──────────────────────────

router.post(
  '/create',
  authenticate,
  [body('tier').isIn(['IGNITE', 'AMPLIFY']).withMessage('Tier must be IGNITE or AMPLIFY')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { tier } = req.body;

      const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!vendor) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      // Check for existing active subscription
      const existing = await prisma.subscription.findFirst({
        where: { vendorId: vendor.id, isActive: true },
      });
      if (existing) {
        sendError(res, { status: 409, code: 'SUBSCRIPTION_EXISTS', message: 'You already have an active subscription. Use upgrade instead.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const customerId = await getOrCreateStripeCustomer(userId, user!.email);

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: PRICE_IDS[tier] }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { vendorId: vendor.id, tier },
      });

      await prisma.subscription.create({
        data: {
          vendorId: vendor.id,
          tier: tier as any,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          isActive: true,
        },
      });

      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { subscriptionTier: tier },
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent;

      sendSuccess(res, {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret ?? null,
        tier,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      }, 201);
    } catch (err) {
      console.error('Create subscription error:', err);
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to create subscription' });
    }
  }
);

// ─── POST /subscriptions/cancel ──────────────────────────

router.post('/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) {
      sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
      return;
    }

    const sub = await prisma.subscription.findFirst({
      where: { vendorId: vendor.id, isActive: true },
    });
    if (!sub) {
      sendError(res, { status: 404, code: 'NO_SUBSCRIPTION', message: 'No active subscription found' });
      return;
    }

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    sendSuccess(res, {
      message: 'Subscription will cancel at end of billing period',
      cancelAt: sub.currentPeriodEnd.toISOString(),
    });
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to cancel subscription' });
  }
});

// ─── POST /subscriptions/upgrade ─────────────────────────

router.post(
  '/upgrade',
  authenticate,
  [body('tier').equals('AMPLIFY').withMessage('Can only upgrade to AMPLIFY')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!vendor) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      const sub = await prisma.subscription.findFirst({
        where: { vendorId: vendor.id, isActive: true },
      });
      if (!sub) {
        sendError(res, { status: 404, code: 'NO_SUBSCRIPTION', message: 'No active subscription to upgrade' });
        return;
      }

      if (sub.tier === 'AMPLIFY') {
        sendError(res, { status: 409, code: 'ALREADY_AMPLIFY', message: 'Already on Amplify tier' });
        return;
      }

      const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);

      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        items: [{
          id: stripeSub.items.data[0].id,
          price: PRICE_IDS.AMPLIFY,
        }],
        proration_behavior: 'always_invoice',
        metadata: { tier: 'AMPLIFY' },
      });

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: 'AMPLIFY' },
      });

      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { subscriptionTier: 'AMPLIFY' },
      });

      sendSuccess(res, { message: 'Upgraded to Amplify', tier: 'AMPLIFY' });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to upgrade subscription' });
    }
  }
);

// ─── GET /subscriptions/me ───────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) {
      sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
      return;
    }

    const sub = await prisma.subscription.findFirst({
      where: { vendorId: vendor.id, isActive: true },
    });

    // Monthly booking count for Spark limit check
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyBookings = await prisma.booking.count({
      where: {
        vendorId: vendor.id,
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' },
      },
    });

    const tier = sub?.tier ?? 'SPARK';
    const features: Record<string, string[]> = {
      SPARK: ['5 bookings per month', 'Basic profile', 'Standard support'],
      IGNITE: ['Unlimited bookings', 'Priority listing', 'Analytics dashboard', 'Priority support', 'Custom profile URL'],
      AMPLIFY: ['Everything in Ignite', 'Featured placement', 'Promoted in search', 'Dedicated account manager', 'Marketing tools'],
    };

    sendSuccess(res, {
      tier,
      isActive: sub?.isActive ?? false,
      currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
      monthlyBookings,
      monthlyLimit: tier === 'SPARK' ? 5 : null,
      features: features[tier] ?? [],
      price: TIER_PRICES[tier] ?? 0,
    });
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch subscription' });
  }
});

export default router;
