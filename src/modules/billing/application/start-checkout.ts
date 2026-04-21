import type { User } from "@supabase/supabase-js";

import type { BillingRepository } from "../domain/billing-repository";
import { CheckoutError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";
import { isPriceVisibleToUser } from "../domain/price";

import { startCheckoutSchema, type StartCheckoutCmd } from "./schemas";

/**
 * Begin a Stripe checkout session for the caller. The subscription is charged
 * immediately on checkout — no trial period — so access is granted the moment
 * the customer completes payment.
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

  // Defence in depth: the UI already filters restricted prices via
  // `isPriceVisibleToUser`, but a crafted form POST must not bypass the gate.
  const price = await ctx.billing.getPriceById(parsed.priceId);
  if (!price || !price.active) {
    throw new CheckoutError("Price not available");
  }
  if (!isPriceVisibleToUser(price, user.id)) {
    throw new CheckoutError("Price not available");
  }

  const customerId = await ctx.payments.getOrCreateCustomer(user);

  const session = await ctx.payments.createCheckoutSession({
    customerId,
    userId: user.id,
    priceId: parsed.priceId,
  });

  return { url: session.url };
};
