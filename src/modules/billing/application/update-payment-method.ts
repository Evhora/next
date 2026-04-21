import type { BillingRepository } from "../domain/billing-repository";
import { CustomerNotFoundError } from "../domain/errors";
import type { PaymentProvider } from "../domain/payment-provider";
import { BillingProvider } from "../domain/provider";

export const updatePaymentMethod = async (ctx: {
  userId: string;
  billing: BillingRepository;
  payments: PaymentProvider;
}): Promise<{ clientSecret: string }> => {
  const customer = await ctx.billing.getCustomerByUserId(
    BillingProvider.STRIPE,
    ctx.userId,
  );
  if (!customer) throw new CustomerNotFoundError();

  const result = await ctx.payments.createSetupIntent(
    customer.providerCustomerId,
  );
  return { clientSecret: result.clientSecret };
};
