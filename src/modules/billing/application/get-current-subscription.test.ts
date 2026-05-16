import { describe, expect, it, vi } from "vitest";

import type { BillingRepository } from "../domain/billing-repository";
import { BillingProvider } from "../domain/provider";
import { Subscription_SubscriptionStatus, newSubscription } from "../domain/subscription";
import { getCurrentSubscription } from "./get-current-subscription";

const USER_ID = "user-abc";

const makeSub = (status = Subscription_SubscriptionStatus.ACTIVE) =>
  newSubscription({
    id: "sub-1",
    userId: USER_ID,
    provider: BillingProvider.STRIPE,
    priceId: "price-1",
    status,
    cancelAtPeriodEnd: false,
    createdAtMs: Date.now(),
  });

const makeRepo = (sub: ReturnType<typeof makeSub> | null): BillingRepository =>
  ({
    getActiveSubscriptionForUser: vi.fn().mockResolvedValue(sub),
  }) as unknown as BillingRepository;

describe("getCurrentSubscription", () => {
  it("returns the active subscription", async () => {
    const sub = makeSub();
    const result = await getCurrentSubscription({ userId: USER_ID, billing: makeRepo(sub) });
    expect(result).toEqual(sub);
  });

  it("returns null when no subscription exists", async () => {
    const result = await getCurrentSubscription({ userId: USER_ID, billing: makeRepo(null) });
    expect(result).toBeNull();
  });
});
