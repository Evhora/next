import type { BillingRepository } from "../domain/billing-repository";
import type { Subscription } from "../domain/subscription";

export const getCurrentSubscription = async (ctx: {
  userId: string;
  billing: BillingRepository;
}): Promise<Subscription | null> =>
  ctx.billing.getActiveSubscriptionForUser(ctx.userId);
