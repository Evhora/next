import type { Customer } from "./customer";
import type { Invoice } from "./invoice";
import type { Price } from "./price";
import type { Product } from "./product";
import type { BillingProvider } from "./provider";
import type { Subscription } from "./subscription";

/**
 * Port for billing data persistence. Read queries run under the session
 * Supabase client (RLS enforced); admin writes (webhook, customer creation)
 * go through the service-role client inside the adapter.
 */
export interface BillingRepository {
  getActiveSubscriptionForUser(userId: string): Promise<Subscription | null>;
  getSubscriptionById(id: string): Promise<Subscription | null>;
  listActiveProducts(): Promise<Product[]>;
  listActivePricesByCurrency(currency: string): Promise<Price[]>;
  getPriceById(id: string): Promise<Price | null>;

  // Admin / webhook writes (service-role, bypass RLS)
  upsertProduct(product: Product): Promise<void>;
  upsertPrice(price: Price): Promise<void>;
  upsertSubscription(subscription: Subscription): Promise<void>;
  upsertCustomer(customer: Customer): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
  deletePrice(priceId: string): Promise<void>;
  // NOTE: subscriptions are never hard-deleted — they are kept for audit
  // history with status=INACTIVE. Use upsertSubscription instead.

  // Invoices
  upsertInvoice(invoice: Invoice): Promise<void>;
  listInvoicesForUser(userId: string): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;

  getCustomerByProviderCustomerId(
    provider: BillingProvider,
    providerCustomerId: string,
  ): Promise<Customer | null>;
  getCustomerByUserId(
    provider: BillingProvider,
    userId: string,
  ): Promise<Customer | null>;
}
