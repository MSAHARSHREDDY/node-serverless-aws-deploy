import 'dotenv/config';
import Stripe from 'stripe';
import { CreatePaymentSessionInput } from "../models/dto/CreatePaymentSessionInput";

// Read environment variables
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!;

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Create Stripe instance with apiVersion
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export const APPLICATION_FEE = (totalAmount: number) => {
  const appFee = 1.5; 
  return (totalAmount / 100) * appFee;
};

export const STRIPE_FEE = (totalAmount: number) => {
  const perTransaction = 2.9;
  const fixCost = 0.29;
  const stripeCost = (totalAmount / 100) * perTransaction;
  return stripeCost + fixCost;
};

export const CreatePaymentSession = async ({
  email,
  phone,
  amount,
  customerId,
}: CreatePaymentSessionInput) => {
  let currentCustomerId: string;

  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    currentCustomerId = customer.id;
  } else {
    const customer = await stripe.customers.create({ email });
    currentCustomerId = customer.id;
  }

  const { client_secret, id } = await stripe.paymentIntents.create({
    customer: currentCustomerId,
    payment_method_types: ["card"],
    amount: Math.round(amount * 100),
    currency: "usd",
  });

  return {
    secret: client_secret,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    paymentId: id,
    customerId: currentCustomerId,
  };
};

export const RetrivePayment = async (paymentId: string) => {
  return stripe.paymentIntents.retrieve(paymentId);
};
