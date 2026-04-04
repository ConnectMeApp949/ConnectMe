import { Router, Request, Response } from 'express';
import express from 'express';
import stripe from '../lib/stripe';
import prisma from '../lib/prisma';
import Stripe from 'stripe';

const router = Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

// Stripe webhooks require raw body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    let event: Stripe.Event;

    try {
      const sig = req.headers['stripe-signature'] as string;
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }

    console.log(`[Webhook] Received: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription;
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              currentPeriodStart: new Date((sub as any).current_period_start * 1000),
              currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
              isActive: sub.status === 'active',
            },
          });
          break;
        }

        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          const dbSub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: sub.id },
          });

          if (dbSub) {
            await prisma.subscription.update({
              where: { id: dbSub.id },
              data: { isActive: false },
            });
            // Downgrade vendor to Spark
            await prisma.vendorProfile.update({
              where: { id: dbSub.vendorId },
              data: { subscriptionTier: 'SPARK' },
            });
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          if (pi.metadata.type === 'booking') {
            await prisma.payment.updateMany({
              where: { stripePaymentIntentId: pi.id },
              data: { status: 'COMPLETED' },
            });
          }
          break;
        }

        case 'transfer.created': {
          const transfer = event.data.object as Stripe.Transfer;
          console.log(`[Webhook] Transfer created: ${transfer.id} amount=${transfer.amount} to=${transfer.destination}`);
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[Webhook] Processing error:', err);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
