import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export async function createPaymentIntent(
  amountCents: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata,
  });
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  amountCents?: number
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents && { amount: amountCents }),
  });
}

export async function createTransfer(
  amountCents: number,
  destinationAccountId: string,
  metadata: Record<string, string>
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount: amountCents,
    currency: 'usd',
    destination: destinationAccountId,
    metadata,
  });
}

export default stripe;
