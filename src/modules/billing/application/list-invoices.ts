import type { BillingRepository } from "../domain/billing-repository";
import type { Invoice } from "../domain/invoice";

export const listInvoices = async (ctx: {
  userId: string;
  billing: BillingRepository;
}): Promise<Invoice[]> => ctx.billing.listInvoicesForUser(ctx.userId);
