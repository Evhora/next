import type { User } from "@supabase/supabase-js";

export interface CheckoutSessionResult {
  url: string;
}

export interface SetupIntentResult {
  clientSecret: string;
}

/**
 * Port for the external payment provider (Stripe). Use cases depend on this
 * interface; the only adapter today is StripePaymentProvider.
 */
export interface PaymentProvider {
  getOrCreateCustomer(user: User): Promise<string>;
  createCheckoutSession(params: {
    customerId: string;
    userId: string;
    priceId: string;
  }): Promise<CheckoutSessionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  /** Cancel immediately (no period-end grace). Used when a refund is issued. */
  cancelSubscriptionImmediately(subscriptionId: string): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  changePlan(subscriptionId: string, newPriceId: string): Promise<void>;
  createSetupIntent(customerId: string): Promise<SetupIntentResult>;
  verifyWebhookSignature(body: string, signature: string): Promise<unknown>;
}
