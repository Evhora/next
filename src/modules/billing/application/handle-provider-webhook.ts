import type Stripe from "stripe";

import type { BillingRepository } from "../domain/billing-repository";
import { newCustomer } from "../domain/customer";
import {
  invoiceStatusFromString,
  mergeInvoiceHistory,
  newInvoice,
} from "../domain/invoice";
import type { PaymentProvider } from "../domain/payment-provider";
import { newPrice } from "../domain/price";
import { newProduct } from "../domain/product";
import { BillingProvider } from "../domain/provider";
import {
  isTrialing,
  mergeSubscriptionHistory,
  newSubscription,
  subscriptionStatusFromProvider,
} from "../domain/subscription";

import { getStripe } from "../infrastructure/stripe-client";

/**
 * Entry point for Stripe webhooks. The handler verifies the signature via the
 * payment provider port, then fans out into small updaters that translate
 * Stripe events into upserts against the billing repository.
 */
export const handleProviderWebhook = async (
  body: string,
  signature: string,
  ctx: { billing: BillingRepository; payments: PaymentProvider },
): Promise<void> => {
  const event = (await ctx.payments.verifyWebhookSignature(
    body,
    signature,
  )) as Stripe.Event;

  switch (event.type) {
    case "product.created":
    case "product.updated": {
      const stripeProduct = event.data.object as Stripe.Product;
      await ctx.billing.upsertProduct(productFromStripe(stripeProduct));
      break;
    }

    case "product.deleted":
      await ctx.billing.deleteProduct((event.data.object as Stripe.Product).id);
      break;

    case "price.created":
    case "price.updated": {
      const stripePrice = event.data.object as Stripe.Price;
      await ctx.billing.upsertPrice(priceFromStripe(stripePrice));
      break;
    }

    case "price.deleted":
      await ctx.billing.deletePrice((event.data.object as Stripe.Price).id);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(stripeSub, ctx.billing);
      break;
    }

    case "customer.subscription.deleted":
      // Keep the row for audit history — Stripe's `canceled` folds into our
      // INACTIVE via `subscriptionStatusFromProvider`, so `hasActiveAccess`
      // drops the user to the free tier.
      await upsertSubscriptionFromStripe(
        event.data.object as Stripe.Subscription,
        ctx.billing,
      );
      break;

    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        ctx.billing,
      );
      break;

    case "invoice.created":
    case "invoice.updated":
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      await handleInvoiceEvent(
        event.data.object as Stripe.Invoice,
        ctx.billing,
      );
      break;
    }

    case "charge.refunded": {
      // Refunding from the dashboard must cancel the subscription immediately.
      await handleChargeRefunded(
        event.data.object as Stripe.Charge,
        ctx.billing,
        ctx.payments,
      );
      break;
    }

    default:
      break;
  }
};

// ─── Stripe → domain mappers ────────────────────────────────────────────────

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw))
    return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed))
          return parsed.filter((x): x is string => typeof x === "string");
      } catch {
        // fall through to CSV
      }
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function productFromStripe(stripeProduct: Stripe.Product) {
  const metadata = (stripeProduct.metadata ?? {}) as Record<string, string>;
  return newProduct({
    id: stripeProduct.id,
    provider: BillingProvider.STRIPE,
    active: stripeProduct.active,
    name: stripeProduct.name,
    description: stripeProduct.description ?? "",
    features: parseFeatures(metadata.features),
    metadata,
  });
}

function priceFromStripe(stripePrice: Stripe.Price) {
  const productId =
    typeof stripePrice.product === "string"
      ? stripePrice.product
      : stripePrice.product.id;
  return newPrice({
    id: stripePrice.id,
    provider: BillingProvider.STRIPE,
    productId,
    active: stripePrice.active,
    currency: stripePrice.currency,
    unitAmount:
      stripePrice.unit_amount != null
        ? BigInt(stripePrice.unit_amount)
        : undefined,
    interval: stripePrice.recurring?.interval ?? undefined,
  });
}

async function upsertSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
  billing: BillingRepository,
): Promise<void> {
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  const customer = await billing.getCustomerByProviderCustomerId(
    BillingProvider.STRIPE,
    customerId,
  );

  if (!customer) {
    console.warn(
      `[stripe sync] no customer row for stripe customer=${customerId}, skipping subscription ${stripeSub.id}`,
    );
    return;
  }

  const firstItem = stripeSub.items.data[0];
  const priceId = firstItem?.price.id ?? "";

  const status = subscriptionStatusFromProvider(stripeSub.status);

  const next = newSubscription({
    id: stripeSub.id,
    userId: customer.userId,
    provider: BillingProvider.STRIPE,
    priceId,
    status,
    trialEndMs: stripeSub.trial_end ? stripeSub.trial_end * 1000 : undefined,
    currentPeriodEndMs: firstItem?.current_period_end
      ? firstItem.current_period_end * 1000
      : undefined,
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    createdAtMs: stripeSub.created * 1000,
  });

  // Load the prior row so `statusHistory` carries over and gains a new entry
  // whenever the domain status actually transitioned.
  const prior = await billing.getSubscriptionById(stripeSub.id);
  await billing.upsertSubscription(mergeSubscriptionHistory(next, prior));
}

async function handleInvoiceEvent(
  stripeInvoice: Stripe.Invoice,
  billing: BillingRepository,
): Promise<void> {
  // Invoices without a customer are system/test artefacts — skip.
  const customerId =
    typeof stripeInvoice.customer === "string"
      ? stripeInvoice.customer
      : stripeInvoice.customer?.id;

  if (!customerId || !stripeInvoice.id) {
    console.warn(
      "[stripe sync] invoice missing customer or id, skipping",
      stripeInvoice.id,
    );
    return;
  }

  const customer = await billing.getCustomerByProviderCustomerId(
    BillingProvider.STRIPE,
    customerId,
  );

  if (!customer) {
    console.warn(
      `[stripe sync] no customer row for stripe customer=${customerId}, skipping invoice ${stripeInvoice.id}`,
    );
    return;
  }

  const subscriptionId =
    typeof (stripeInvoice as unknown as { subscription?: unknown })
      .subscription === "string"
      ? ((stripeInvoice as unknown as { subscription: string }).subscription ??
        "")
      : ((stripeInvoice as unknown as { subscription?: { id?: string } | null })
          .subscription?.id ?? "");

  // Trial invoices are $0 placeholders Stripe emits for bookkeeping — they're
  // never "payable" from the user's perspective, so we skip persisting them.
  // We gate on our own subscription status (not the Stripe event) so the
  // answer is consistent with what `hasActiveAccess` sees.
  const currentSub = await billing.getActiveSubscriptionForUser(
    customer.userId,
  );
  if (currentSub && isTrialing(currentSub)) {
    return;
  }

  const next = newInvoice({
    id: stripeInvoice.id,
    provider: BillingProvider.STRIPE,
    userId: customer.userId,
    subscriptionId,
    status: invoiceStatusFromString(stripeInvoice.status ?? null),
    amountDue: BigInt(stripeInvoice.amount_due ?? 0),
    amountPaid: BigInt(stripeInvoice.amount_paid ?? 0),
    currency: stripeInvoice.currency,
    number: stripeInvoice.number ?? "",
    hostedInvoiceUrl: stripeInvoice.hosted_invoice_url ?? "",
    invoicePdf: stripeInvoice.invoice_pdf ?? "",
    createdAtMs: stripeInvoice.created * 1000,
  });

  const prior = await billing.getInvoiceById(stripeInvoice.id);
  await billing.upsertInvoice(mergeInvoiceHistory(next, prior));
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  billing: BillingRepository,
  payments: PaymentProvider,
): Promise<void> {
  // Stripe's typed `Charge` no longer exposes `invoice` directly — the field
  // is only present on expanded responses. Cast to read it without widening
  // the call site to an `any`.
  const chargeWithInvoice = charge as unknown as {
    invoice?: string | { id?: string } | null;
  };
  const invoiceId =
    typeof chargeWithInvoice.invoice === "string"
      ? chargeWithInvoice.invoice
      : chargeWithInvoice.invoice?.id;

  if (!invoiceId) {
    console.log(
      "[stripe sync] charge.refunded has no invoice, skipping",
      charge.id,
    );
    return;
  }

  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const subscriptionId =
    typeof (invoice as unknown as { subscription?: unknown }).subscription ===
    "string"
      ? (invoice as unknown as { subscription: string }).subscription
      : (invoice as unknown as { subscription?: { id?: string } | null })
          .subscription?.id;

  if (!subscriptionId) {
    console.log(
      "[stripe sync] refunded invoice has no subscription, skipping",
      invoiceId,
    );
    return;
  }

  console.log(
    `[stripe sync] charge ${charge.id} refunded — cancelling subscription ${subscriptionId}`,
  );

  // Cancel in Stripe immediately. This fires customer.subscription.deleted,
  // which our handler will upsert — Stripe's `canceled` folds into our
  // INACTIVE, so `hasActiveAccess` drops the user to the free tier.
  await payments.cancelSubscriptionImmediately(subscriptionId);

  // Eagerly sync the now-canceled subscription so access drops immediately,
  // without waiting for the follow-up webhook.
  const canceledSub = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscriptionFromStripe(canceledSub, billing);
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  billing: BillingRepository,
): Promise<void> {
  const userId = session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!userId || !customerId) {
    console.warn("[stripe sync] checkout.session.completed missing ids", {
      userId,
      customerId,
    });
    return;
  }

  await billing.upsertCustomer(
    newCustomer({
      userId,
      provider: BillingProvider.STRIPE,
      providerCustomerId: customerId,
    }),
  );

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await upsertSubscriptionFromStripe(subscription, billing);
  }
}
