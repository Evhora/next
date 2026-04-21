import type { BillingRepository } from "../domain/billing-repository";
import { CheckoutError, SubscriptionNotFoundError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";
import { isPriceVisibleToUser } from "../domain/price";

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

  // Enforce the price allowlist server-side — the dropdown filters restricted
  // prices, but a crafted form POST must not bypass the gate.
  const price = await ctx.billing.getPriceById(parsed.newPriceId);
  if (!price || !price.active) {
    throw new CheckoutError("Price not available");
  }
  if (!isPriceVisibleToUser(price, ctx.userId)) {
    throw new CheckoutError("Price not available");
  }

  await ctx.payments.changePlan(sub.id, parsed.newPriceId);
};
