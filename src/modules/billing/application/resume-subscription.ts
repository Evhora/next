import type { BillingRepository } from "../domain/billing-repository";
import { SubscriptionNotFoundError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";

export const resumeSubscription = async (ctx: {
  userId: string;
  billing: BillingRepository;
  payments: PaymentProvider;
}): Promise<void> => {
  const sub = await ctx.billing.getActiveSubscriptionForUser(ctx.userId);
  if (!sub) {
    throw new SubscriptionNotFoundError();
  }

  await ctx.payments.resumeSubscription(sub.id);
};
