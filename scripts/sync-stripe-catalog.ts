/**
 * Pull products and prices from Stripe and mirror them into
 * `billing_products` / `billing_prices` using the same upsert helpers the
 * webhook uses. Idempotent — safe to re-run.
 *
 * Stripe is the source of truth for the catalog: products and prices are
 * created and edited in the Stripe dashboard, never by this script. This
 * script exists for two cases:
 *   1. Bootstrapping a fresh Supabase environment whose `billing_products` /
 *      `billing_prices` are empty because product/price webhooks fired
 *      before the database existed.
 *   2. Recovering from missed webhook events (e.g. local dev without
 *      `stripe listen` running).
 *
 * Usage: pnpm sync:stripe
 *
 * Requires env vars: STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY (loaded from .env.local via --env-file).
 */
import type Stripe from "stripe";

import { newPrice } from "@/modules/billing/domain/price";
import { newProduct } from "@/modules/billing/domain/product";
import { BillingProvider } from "@/modules/billing/domain/provider";
import { getStripe } from "@/modules/billing/infrastructure/stripe-client";
import { SupabaseBillingRepository } from "@/modules/billing/infrastructure/supabase-billing-repository";
import { createAdminClient } from "@/shared/supabase/admin";

// ── Helpers ────────────────────────────────────────────────────────────────
function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw))
    return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed))
          return parsed.filter((x): x is string => typeof x === "string");
      } catch {
        // fall through to CSV
      }
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

async function* iterateAllProducts(
  stripe: Stripe,
): AsyncGenerator<Stripe.Product> {
  for await (const product of stripe.products.list({ limit: 100 })) {
    yield product;
  }
}

async function* iterateAllPrices(
  stripe: Stripe,
  productId: string,
): AsyncGenerator<Stripe.Price> {
  for await (const price of stripe.prices.list({
    product: productId,
    limit: 100,
  })) {
    yield price;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const stripe = getStripe();
  const admin = createAdminClient();
  const billing = new SupabaseBillingRepository(admin as never);

  let productCount = 0;
  let priceCount = 0;

  for await (const stripeProduct of iterateAllProducts(stripe)) {
    const metadata = (stripeProduct.metadata ?? {}) as Record<string, string>;

    await billing.upsertProduct(
      newProduct({
        id: stripeProduct.id,
        provider: BillingProvider.STRIPE,
        active: stripeProduct.active,
        name: stripeProduct.name,
        description: stripeProduct.description ?? "",
        features: parseFeatures(metadata.features),
        metadata,
      }),
    );
    productCount += 1;
    console.log(
      `[sync] product: ${stripeProduct.id} (${stripeProduct.name}) — active=${stripeProduct.active}`,
    );

    for await (const stripePrice of iterateAllPrices(stripe, stripeProduct.id)) {
      await billing.upsertPrice(
        newPrice({
          id: stripePrice.id,
          provider: BillingProvider.STRIPE,
          productId: stripeProduct.id,
          active: stripePrice.active,
          currency: stripePrice.currency,
          unitAmount:
            stripePrice.unit_amount != null
              ? BigInt(stripePrice.unit_amount)
              : undefined,
          interval: stripePrice.recurring?.interval ?? undefined,
        }),
      );
      priceCount += 1;

      const formatted =
        stripePrice.unit_amount != null
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: stripePrice.currency.toUpperCase(),
            }).format(stripePrice.unit_amount / 100)
          : "—";

      console.log(
        `[sync]   price: ${stripePrice.id} — ${formatted}/${stripePrice.recurring?.interval ?? "one-time"} — active=${stripePrice.active}`,
      );
    }
  }

  console.log(
    `[sync] done — mirrored ${productCount} product(s) and ${priceCount} price(s)`,
  );
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
