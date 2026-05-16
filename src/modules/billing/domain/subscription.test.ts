import { describe, expect, it } from "vitest";

import { BillingProvider } from "./provider";
import {
  Subscription_SubscriptionStatus,
  hasActiveAccess,
  isTrialing,
  mergeSubscriptionHistory,
  newSubscription,
  subscriptionStatusFromProvider,
  subscriptionStatusFromString,
  subscriptionStatusToName,
  subscriptionStatusToString,
} from "./subscription";

const BASE_CMD = {
  id: "sub-1",
  userId: "user-1",
  provider: BillingProvider.STRIPE,
  priceId: "price-1",
  status: Subscription_SubscriptionStatus.ACTIVE,
  cancelAtPeriodEnd: false,
  createdAtMs: Date.now(),
};

describe("newSubscription", () => {
  it("creates subscription with expected fields", () => {
    const sub = newSubscription(BASE_CMD);
    expect(sub.id).toBe("sub-1");
    expect(sub.userId).toBe("user-1");
    expect(sub.status).toBe(Subscription_SubscriptionStatus.ACTIVE);
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it("sets trialEnd when trialEndMs provided", () => {
    const sub = newSubscription({ ...BASE_CMD, trialEndMs: Date.now() + 7 * 86400000 });
    expect(sub.trialEnd).toBeTruthy();
  });
});

describe("hasActiveAccess", () => {
  it("returns true for ACTIVE", () => {
    const sub = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.ACTIVE });
    expect(hasActiveAccess(sub)).toBe(true);
  });

  it("returns true for TRIALING", () => {
    const sub = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.TRIALING });
    expect(hasActiveAccess(sub)).toBe(true);
  });

  it("returns false for INACTIVE", () => {
    const sub = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.INACTIVE });
    expect(hasActiveAccess(sub)).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasActiveAccess(null)).toBe(false);
  });
});

describe("isTrialing", () => {
  it("returns true when TRIALING", () => {
    const sub = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.TRIALING });
    expect(isTrialing(sub)).toBe(true);
  });

  it("returns false when ACTIVE", () => {
    const sub = newSubscription(BASE_CMD);
    expect(isTrialing(sub)).toBe(false);
  });
});

describe("subscriptionStatusToString / FromString", () => {
  it("round-trips known statuses", () => {
    const statuses = [
      Subscription_SubscriptionStatus.TRIALING,
      Subscription_SubscriptionStatus.ACTIVE,
      Subscription_SubscriptionStatus.INACTIVE,
    ];
    for (const s of statuses) {
      expect(subscriptionStatusFromString(subscriptionStatusToString(s))).toBe(s);
    }
  });

  it("defaults unknown string to INACTIVE", () => {
    expect(subscriptionStatusFromString("unknown")).toBe(Subscription_SubscriptionStatus.INACTIVE);
  });
});

describe("subscriptionStatusToName", () => {
  it("returns proto enum name strings", () => {
    expect(subscriptionStatusToName(Subscription_SubscriptionStatus.ACTIVE)).toBe("SUBSCRIPTION_STATUS_ACTIVE");
    expect(subscriptionStatusToName(Subscription_SubscriptionStatus.TRIALING)).toBe("SUBSCRIPTION_STATUS_TRIALING");
    expect(subscriptionStatusToName(Subscription_SubscriptionStatus.INACTIVE)).toBe("SUBSCRIPTION_STATUS_INACTIVE");
  });
});

describe("subscriptionStatusFromProvider", () => {
  it("maps Stripe statuses correctly", () => {
    expect(subscriptionStatusFromProvider("trialing")).toBe(Subscription_SubscriptionStatus.TRIALING);
    expect(subscriptionStatusFromProvider("active")).toBe(Subscription_SubscriptionStatus.ACTIVE);
    expect(subscriptionStatusFromProvider("past_due")).toBe(Subscription_SubscriptionStatus.ACTIVE);
    expect(subscriptionStatusFromProvider("canceled")).toBe(Subscription_SubscriptionStatus.INACTIVE);
    expect(subscriptionStatusFromProvider("unpaid")).toBe(Subscription_SubscriptionStatus.INACTIVE);
    expect(subscriptionStatusFromProvider("paused")).toBe(Subscription_SubscriptionStatus.INACTIVE);
  });
});

describe("mergeSubscriptionHistory", () => {
  it("appends a history entry on status change", () => {
    const prior = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.TRIALING });
    const next = newSubscription({ ...BASE_CMD, status: Subscription_SubscriptionStatus.ACTIVE });
    const merged = mergeSubscriptionHistory(next, prior);
    expect(merged.statusHistory).toHaveLength(1);
    expect(merged.statusHistory[0].status).toBe(Subscription_SubscriptionStatus.ACTIVE);
  });

  it("does not duplicate entry for same status", () => {
    const prior = newSubscription(BASE_CMD);
    // Give prior a history entry at ACTIVE
    const withHistory = mergeSubscriptionHistory(prior, null);
    const next = newSubscription(BASE_CMD);
    const merged = mergeSubscriptionHistory(next, withHistory);
    // Still only one entry (no dupe)
    expect(merged.statusHistory).toHaveLength(1);
  });

  it("creates first entry when prior is null", () => {
    const sub = newSubscription(BASE_CMD);
    const merged = mergeSubscriptionHistory(sub, null);
    expect(merged.statusHistory).toHaveLength(1);
  });
});
