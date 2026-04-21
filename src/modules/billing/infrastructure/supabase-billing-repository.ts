import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import { createAdminClient } from "@/shared/supabase/admin";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import type { BillingRepository } from "../domain/billing-repository";
import { type Customer, CustomerSchema, newCustomer } from "../domain/customer";
import {
  type Invoice,
  InvoiceSchema,
  invoiceStatusToName,
  invoiceStatusToString,
} from "../domain/invoice";
import { type Price, PriceSchema } from "../domain/price";
import { type Product, ProductSchema } from "../domain/product";
import {
  BillingProvider,
  providerFromString,
  providerToName,
  providerToString,
} from "../domain/provider";
import {
  type Subscription,
  SubscriptionSchema,
  subscriptionStatusToName,
  subscriptionStatusToString,
} from "../domain/subscription";

/**
 * Supabase implementation of BillingRepository.
 *
 * Reads go through the session-scoped client (RLS enforced). Admin writes
 * (webhook, customer creation, trial insert) go through the service-role
 * client, because they originate from trusted server code that has already
 * authenticated the caller.
 *
 * The JSONB `data` column stores the full proto-JSON for each entity;
 * promoted columns exist only for RLS / indexes / ordering. Reads project
 * `data` and decode via `fromProtoJson`; writes emit `toProtoJson` and
 * mirror promoted fields into their columns.
 */
export class SupabaseBillingRepository implements BillingRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async getActiveSubscriptionForUser(
    userId: string,
  ): Promise<Subscription | null> {
    // Fetch the most recent subscription row for the user regardless of
    // status — lapsed rows are intentionally kept for audit history and for
    // the "reactivate" CTA on the billing page. Access gating is the
    // caller's job via `hasActiveAccess(sub)`.
    const { data: row, error } = await this.db
      .from("billing_subscriptions")
      .select("data")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!row) return null;

    return fromProtoJson(SubscriptionSchema, row.data as JsonValue);
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    // Webhook-path lookup — bypass RLS via the admin client because incoming
    // Stripe events have no authenticated session.
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("billing_subscriptions")
      .select("data")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!row) return null;

    return fromProtoJson(SubscriptionSchema, row.data as JsonValue);
  }

  async listActiveProducts(): Promise<Product[]> {
    const { data, error } = await this.db
      .from("billing_products")
      .select("data")
      .eq("active", true)
      .eq("provider", providerToString(BillingProvider.STRIPE));

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(ProductSchema, row.data as JsonValue),
    );
  }

  async listActivePricesByCurrency(currency: string): Promise<Price[]> {
    const { data, error } = await this.db
      .from("billing_prices")
      .select("data")
      .eq("active", true)
      .eq("currency", currency)
      .eq("provider", providerToString(BillingProvider.STRIPE));

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(PriceSchema, row.data as JsonValue),
    );
  }

  async getPriceById(id: string): Promise<Price | null> {
    // Checkout guard lookup — prices are public catalog data, but we route
    // through the admin client so pre-auth flows (anonymous → login → back)
    // stay consistent with webhook-driven reads.
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("billing_prices")
      .select("data")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!row) return null;

    return fromProtoJson(PriceSchema, row.data as JsonValue);
  }

  // ── Admin writes (service-role) ──────────────────────────────────────────

  async upsertProduct(product: Product): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("billing_products").upsert({
      id: product.id,
      provider: providerToString(product.provider),
      provider_name: providerToName(product.provider),
      active: product.active,
      data: toProtoJson(ProductSchema, product) as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async upsertPrice(price: Price): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("billing_prices").upsert({
      id: price.id,
      provider: providerToString(price.provider),
      provider_name: providerToName(price.provider),
      product_id: price.productId,
      active: price.active,
      currency: price.currency,
      data: toProtoJson(PriceSchema, price) as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async upsertSubscription(subscription: Subscription): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("billing_subscriptions").upsert({
      id: subscription.id,
      user_id: subscription.userId,
      provider: providerToString(subscription.provider),
      provider_name: providerToName(subscription.provider),
      price_id: subscription.priceId || null,
      status: subscriptionStatusToString(subscription.status),
      status_name: subscriptionStatusToName(subscription.status),
      trial_end: subscription.trialEnd
        ? timestampDate(subscription.trialEnd).toISOString()
        : null,
      current_period_end: subscription.currentPeriodEnd
        ? timestampDate(subscription.currentPeriodEnd).toISOString()
        : null,
      data: toProtoJson(SubscriptionSchema, subscription) as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async upsertCustomer(customer: Customer): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("billing_customers").upsert(
      {
        user_id: customer.userId,
        provider: providerToString(customer.provider),
        provider_name: providerToName(customer.provider),
        provider_customer_id: customer.providerCustomerId,
        data: toProtoJson(CustomerSchema, customer) as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    );
    if (error) throw new IntegrationError(error.message);
  }

  async deleteProduct(productId: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("billing_products")
      .delete()
      .eq("id", productId);
    if (error) throw new IntegrationError(error.message);
  }

  async deletePrice(priceId: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("billing_prices")
      .delete()
      .eq("id", priceId);
    if (error) throw new IntegrationError(error.message);
  }

  async upsertInvoice(invoice: Invoice): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("billing_invoices").upsert({
      id: invoice.id,
      provider: providerToString(invoice.provider),
      provider_name: providerToName(invoice.provider),
      user_id: invoice.userId,
      subscription_id: invoice.subscriptionId || null,
      status: invoiceStatusToString(invoice.status) ?? "draft",
      status_name: invoiceStatusToName(invoice.status),
      amount_due: Number(invoice.amountDue),
      amount_paid: Number(invoice.amountPaid),
      currency: invoice.currency,
      number: invoice.number,
      data: toProtoJson(InvoiceSchema, invoice) as Json,
      created_at: invoice.createdAt
        ? timestampDate(invoice.createdAt).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    // Webhook-path lookup — bypass RLS, same rationale as getSubscriptionById.
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("billing_invoices")
      .select("data")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!row) return null;

    return fromProtoJson(InvoiceSchema, row.data as JsonValue);
  }

  async listInvoicesForUser(userId: string): Promise<Invoice[]> {
    const { data, error } = await this.db
      .from("billing_invoices")
      .select("data")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(48);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(InvoiceSchema, row.data as JsonValue),
    );
  }

  async getCustomerByProviderCustomerId(
    provider: BillingProvider,
    providerCustomerId: string,
  ): Promise<Customer | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("billing_customers")
      .select("data, user_id, provider, provider_customer_id")
      .eq("provider", providerToString(provider))
      .eq("provider_customer_id", providerCustomerId)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!data) return null;

    return decodeCustomerRow(data);
  }

  async getCustomerByUserId(
    provider: BillingProvider,
    userId: string,
  ): Promise<Customer | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("billing_customers")
      .select("data, user_id, provider, provider_customer_id")
      .eq("provider", providerToString(provider))
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    if (!data) return null;

    return decodeCustomerRow(data);
  }
}

// Customer rows may pre-date the proto-JSON convention (e.g. created by the
// provisional insert in `getOrCreateCustomer` before the webhook runs). Fall
// back to a synthetic entity built from the promoted columns so callers always
// get a usable domain value.
function decodeCustomerRow(row: {
  data: Json | null;
  user_id: string;
  provider: string;
  provider_customer_id: string;
}): Customer {
  const raw = row.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    try {
      return fromProtoJson(CustomerSchema, raw as JsonValue);
    } catch {
      // fall through
    }
  }
  return newCustomer({
    userId: row.user_id,
    provider: providerFromString(row.provider),
    providerCustomerId: row.provider_customer_id,
  });
}
