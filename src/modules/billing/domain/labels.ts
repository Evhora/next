import { Subscription_SubscriptionStatus } from "@/modules/billing/proto/v1/subscription_pb";

/**
 * UI-facing metadata for the subscription status enum. Translation keys live
 * here so the `.proto` stays schema-only. Join with
 * `pages.billing.status.<key>` for display.
 */

export const SUBSCRIPTION_STATUS_TRANSLATION_KEYS: Record<
  Subscription_SubscriptionStatus,
  string
> = {
  [Subscription_SubscriptionStatus.UNSPECIFIED]: "inactive",
  // Trial terminology is retired from the UI — any TRIALING row (e.g. a
  // legacy sub or a Stripe edge-case like a coupon-driven trial) still
  // displays as "active" since access is equivalent.
  [Subscription_SubscriptionStatus.TRIALING]: "active",
  [Subscription_SubscriptionStatus.ACTIVE]: "active",
  [Subscription_SubscriptionStatus.INACTIVE]: "inactive",
};
