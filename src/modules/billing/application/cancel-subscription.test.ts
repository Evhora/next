import { describe, expect, it, vi } from "vitest";

import type { BillingRepository } from "../domain/billing-repository";
import { SubscriptionNotFoundError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";
import { BillingProvider } from "../domain/provider";
import { Subscription_SubscriptionStatus, newSubscription } from "../domain/subscription";
import { cancelSubscription } from "./cancel-subscription";

const USER_ID = "user-abc";

const makeSub = () =>
  newSubscription({
    id: "sub-1",
    userId: USER_ID,
    provider: BillingProvider.STRIPE,
    priceId: "price-1",
    status: Subscription_SubscriptionStatus.ACTIVE,
    cancelAtPeriodEnd: false,
    createdAtMs: Date.now(),
  });

const makePayments = (): PaymentProvider =>
  ({
    cancelSubscription: vi.fn().mockResolvedValue(undefined),
  }) as unknown as PaymentProvider;

describe("cancelSubscription", () => {
  it("calls payments.cancelSubscription with the subscription id", async () => {
    const sub = makeSub();
    const billing = { getActiveSubscriptionForUser: vi.fn().mockResolvedValue(sub) } as unknown as BillingRepository;
    const payments = makePayments();

    await cancelSubscription({ userId: USER_ID, billing, payments });

    expect(payments.cancelSubscription).toHaveBeenCalledWith(sub.id);
  });

  it("throws SubscriptionNotFoundError when no active subscription", async () => {
    const billing = { getActiveSubscriptionForUser: vi.fn().mockResolvedValue(null) } as unknown as BillingRepository;
    const payments = makePayments();

    await expect(cancelSubscription({ userId: USER_ID, billing, payments })).rejects.toThrow(
      SubscriptionNotFoundError,
    );
    expect(payments.cancelSubscription).not.toHaveBeenCalled();
  });
});
