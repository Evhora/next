import type { BillingRepository } from "../domain/billing-repository";
import { SubscriptionNotFoundError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";

import { changePlanSchema, type ChangePlanCmd } from "./schemas";

export const changePlan = async (
  cmd: ChangePlanCmd,
  ctx: {
    userId: string;
    billing: BillingRepository;
    payments: PaymentProvider;
  },
): Promise<void> => {
  const parsed = changePlanSchema.parse(cmd);

  const sub = await ctx.billing.getActiveSubscriptionForUser(ctx.userId);
  if (!sub) {
    throw new SubscriptionNotFoundError();
  }

  await ctx.payments.changePlan(sub.id, parsed.newPriceId);
};
