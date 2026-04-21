import { create } from "@bufbuild/protobuf";
import { type Timestamp, timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Subscription,
  type Subscription_StatusChange,
  Subscription_StatusChangeSchema,
  Subscription_SubscriptionStatus,
  SubscriptionSchema,
} from "@/modules/billing/proto/v1/subscription_pb";

import { BillingProvider } from "./provider";

/**
 * Domain surface for the Subscription entity. `Subscription` is the generated
 * proto type; invariants and mutators are free functions kept immutable.
 *
 * The status enum is provider-agnostic and intentionally narrow:
 * TRIALING / ACTIVE / INACTIVE. Grace-period nuance (Stripe's `past_due`,
 * `incomplete`, etc.) folds into ACTIVE; terminal states (`canceled`,
 * `unpaid`, `incomplete_expired`, `paused`) fold into INACTIVE. The raw
 * provider status lives in the `data` JSONB blob for diagnostics.
 */

export {
  Subscription_StatusChangeSchema,
  Subscription_SubscriptionStatus,
  SubscriptionSchema,
};
export type { Subscription, Subscription_StatusChange };

/** True when the subscription grants paid-tier access. */
export const hasActiveAccess = (sub: Subscription | null): boolean =>
  sub != null &&
  (sub.status === Subscription_SubscriptionStatus.TRIALING ||
    sub.status === Subscription_SubscriptionStatus.ACTIVE);

/** True when the subscription is trialing. */
export const isTrialing = (sub: Subscription): boolean =>
  sub.status === Subscription_SubscriptionStatus.TRIALING;

/**
 * Short lowercase label for the `status` column. Stable across migrations
 * and what queries filter on.
 */
export const subscriptionStatusToString = (
  status: Subscription_SubscriptionStatus,
): string => {
  switch (status) {
    case Subscription_SubscriptionStatus.TRIALING:
      return "trialing";
    case Subscription_SubscriptionStatus.ACTIVE:
      return "active";
    case Subscription_SubscriptionStatus.INACTIVE:
      return "inactive";
    default:
      return "inactive";
  }
};

export const subscriptionStatusFromString = (
  value: string,
): Subscription_SubscriptionStatus => {
  switch (value) {
    case "trialing":
      return Subscription_SubscriptionStatus.TRIALING;
    case "active":
      return Subscription_SubscriptionStatus.ACTIVE;
    case "inactive":
      return Subscription_SubscriptionStatus.INACTIVE;
    default:
      return Subscription_SubscriptionStatus.INACTIVE;
  }
};

/**
 * Fully-qualified proto enum name for the `status_name` column. Mirrors
 * `<EnumName>` in the .proto exactly — e.g. `SUBSCRIPTION_STATUS_TRIALING`.
 */
export const subscriptionStatusToName = (
  status: Subscription_SubscriptionStatus,
): string => {
  switch (status) {
    case Subscription_SubscriptionStatus.TRIALING:
      return "SUBSCRIPTION_STATUS_TRIALING";
    case Subscription_SubscriptionStatus.ACTIVE:
      return "SUBSCRIPTION_STATUS_ACTIVE";
    case Subscription_SubscriptionStatus.INACTIVE:
      return "SUBSCRIPTION_STATUS_INACTIVE";
    default:
      return "SUBSCRIPTION_STATUS_UNSPECIFIED";
  }
};

/**
 * Map a provider-specific subscription status string to the domain enum.
 * Stripe vocabulary:
 *   - `trialing`                      → TRIALING
 *   - `active`, `past_due`            → ACTIVE (grace preserved)
 *   - everything else (canceled,
 *     unpaid, incomplete, expired,
 *     paused)                         → INACTIVE
 */
export const subscriptionStatusFromProvider = (
  providerStatus: string,
): Subscription_SubscriptionStatus => {
  switch (providerStatus) {
    case "trialing":
      return Subscription_SubscriptionStatus.TRIALING;
    case "active":
    case "past_due":
      return Subscription_SubscriptionStatus.ACTIVE;
    default:
      return Subscription_SubscriptionStatus.INACTIVE;
  }
};

// ─── Factories ─────────────────────────────────────────────────────────────

function tsFromMs(ms: number): Timestamp {
  const ts = timestampNow();
  ts.seconds = BigInt(Math.floor(ms / 1000));
  ts.nanos = 0;
  return ts;
}

export interface NewSubscriptionCmd {
  id: string;
  userId: string;
  provider: BillingProvider;
  priceId: string;
  status: Subscription_SubscriptionStatus;
  trialEndMs?: number;
  currentPeriodEndMs?: number;
  cancelAtPeriodEnd: boolean;
  createdAtMs: number;
}

export function newSubscription(cmd: NewSubscriptionCmd): Subscription {
  return create(SubscriptionSchema, {
    id: cmd.id,
    userId: cmd.userId,
    provider: cmd.provider,
    priceId: cmd.priceId,
    status: cmd.status,
    trialEnd: cmd.trialEndMs ? tsFromMs(cmd.trialEndMs) : undefined,
    currentPeriodEnd: cmd.currentPeriodEndMs
      ? tsFromMs(cmd.currentPeriodEndMs)
      : undefined,
    cancelAtPeriodEnd: cmd.cancelAtPeriodEnd,
    createdAt: tsFromMs(cmd.createdAtMs),
    updatedAt: timestampNow(),
  });
}

/**
 * Merge a freshly-derived subscription with its prior state so the
 * `statusHistory` log carries over and gains a new entry whenever the status
 * actually transitioned. Callers pass the current DB row (`prior`) and the
 * newly-built value (`next`); the returned subscription is what gets upserted.
 *
 * Noop when the latest logged status already matches `next.status` — we don't
 * emit duplicate entries for identical-status webhook replays.
 */
export function mergeSubscriptionHistory(
  next: Subscription,
  prior: Subscription | null,
): Subscription {
  const priorHistory = prior?.statusHistory ?? [];
  const lastStatus = priorHistory.at(-1)?.status ?? prior?.status;

  if (prior && lastStatus === next.status) {
    return { ...next, statusHistory: priorHistory };
  }

  const entry = create(Subscription_StatusChangeSchema, {
    status: next.status,
    changedAt: timestampNow(),
  });
  return { ...next, statusHistory: [...priorHistory, entry] };
}
