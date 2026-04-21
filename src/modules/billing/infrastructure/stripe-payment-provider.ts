import type { User } from "@supabase/supabase-js";

import { toProtoJson } from "@/shared/proto/json";
import { createAdminClient } from "@/shared/supabase/admin";
import type { Json } from "@/shared/supabase/database.types";

import { CustomerSchema, newCustomer } from "../domain/customer";
import type {
  CheckoutSessionResult,
  PaymentProvider,
  SetupIntentResult,
} from "../domain/payment-provider";

import {
  BillingProvider,
  providerToName,
  providerToString,
} from "../domain/provider";

import { getCheckoutCancelUrl, getCheckoutSuccessUrl } from "./billing-config";
import { getStripe } from "./stripe-client";

const STRIPE_PROVIDER_LABEL = providerToString(BillingProvider.STRIPE);
const STRIPE_PROVIDER_NAME = providerToName(BillingProvider.STRIPE);

/**
 * Stripe adapter for the `PaymentProvider` port. Uses the admin Supabase
 * client to read/write the `billing_customers` table so we can resolve a
 * user's Stripe customer id without going through the session client.
 */
export class StripePaymentProvider implements PaymentProvider {
  async getOrCreateCustomer(user: User): Promise<string> {
    const admin = createAdminClient();
    const stripe = getStripe();

    const { data: existing, error } = await admin
      .from("billing_customers")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .eq("provider", STRIPE_PROVIDER_LABEL)
      .maybeSingle();
    if (error) throw error;

    if (existing?.provider_customer_id) {
      try {
        const retrieved = await stripe.customers.retrieve(
          existing.provider_customer_id,
        );
        if (!retrieved.deleted) return existing.provider_customer_id;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code !== "resource_missing") throw err;
      }

      const { error: delErr } = await admin
        .from("billing_customers")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", STRIPE_PROVIDER_LABEL);
      if (delErr) throw delErr;
    }

    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });

    // The `data` column is NOT NULL — it's the proto-JSON source of truth for
    // the customer entity, with the promoted columns mirrored off it for
    // indexing. Omit it and the INSERT hits a 23502. Build a domain `Customer`
    // via the factory and serialise it here so this row matches what the
    // webhook-driven `upsertCustomer` path would write.
    const domainCustomer = newCustomer({
      userId: user.id,
      provider: BillingProvider.STRIPE,
      providerCustomerId: customer.id,
    });

    const { error: insertErr } = await admin.from("billing_customers").insert({
      user_id: user.id,
      provider: STRIPE_PROVIDER_LABEL,
      provider_name: STRIPE_PROVIDER_NAME,
      provider_customer_id: customer.id,
      data: toProtoJson(CustomerSchema, domainCustomer) as Json,
    });
    if (insertErr) throw insertErr;

    return customer.id;
  }

  async createCheckoutSession(params: {
    customerId: string;
    userId: string;
    priceId: string;
  }): Promise<CheckoutSessionResult> {
    const stripe = getStripe();

    // No trial — Checkout in `subscription` mode charges the first invoice
    // immediately by default, so access is granted the moment payment
    // completes. We intentionally omit `subscription_data.trial_end` because
    // Checkout's API accepts only a Unix timestamp there (the string `"now"`
    // is valid on `subscriptions.create` but NOT on Checkout Sessions — it
    // silently rejects the whole request).
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: params.customerId,
      client_reference_id: params.userId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: getCheckoutSuccessUrl(),
      cancel_url: getCheckoutCancelUrl(),
      allow_promotion_codes: false,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return { url: session.url };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async cancelSubscriptionImmediately(subscriptionId: string): Promise<void> {
    const stripe = getStripe();
    await stripe.subscriptions.cancel(subscriptionId);
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async changePlan(subscriptionId: string, newPriceId: string): Promise<void> {
    const stripe = getStripe();
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    const item = current.items.data[0];
    if (!item) throw new Error("Subscription has no items");

    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: item.id, price: newPriceId }],
      proration_behavior: "create_prorations",
    });
  }

  async createSetupIntent(customerId: string): Promise<SetupIntentResult> {
    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });
    if (!setupIntent.client_secret) {
      throw new Error("Stripe did not return a SetupIntent client_secret");
    }
    return { clientSecret: setupIntent.client_secret };
  }

  async verifyWebhookSignature(
    body: string,
    signature: string,
  ): Promise<unknown> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");

    const stripe = getStripe();
    return stripe.webhooks.constructEvent(body, signature, secret);
  }
}
