import type { User } from "@supabase/supabase-js";

import type { BillingRepository } from "../domain/billing-repository";
import { CheckoutError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";

import { startCheckoutSchema, type StartCheckoutCmd } from "./schemas";

const TRIAL_DAYS = 15;

/**
 * Begin a Stripe checkout session for the caller. A 15-day trial is carried
 * over to Stripe so the card is not charged until the trial window ends.
 */
export const startCheckout = async (
  cmd: StartCheckoutCmd & { user: User },
  ctx: { billing: BillingRepository; payments: PaymentProvider },
): Promise<{ url: string }> => {
  const parsed = startCheckoutSchema.parse({ priceId: cmd.priceId });
  const { user } = cmd;

  if (!parsed.priceId) {
    throw new CheckoutError("Missing priceId");
  }

  const trialEnd = Math.floor(
    (Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) / 1000,
  );

  const customerId = await ctx.payments.getOrCreateCustomer(user);

  const session = await ctx.payments.createCheckoutSession({
    customerId,
    userId: user.id,
    priceId: parsed.priceId,
    trialEnd,
  });

  return { url: session.url };
};
