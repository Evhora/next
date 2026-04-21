/**
 * Seeds the "Premium" product (R$ 29/mês or R$ 299,90/ano, BRL) into Stripe
 * and mirrors it into billing_products / billing_prices via the same upsert
 * helpers used by the webhook. Idempotent — safe to re-run.
 *
 * Usage: pnpm seed:stripe
 *
 * Requires env vars: STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY (loaded from .env.local via --env-file).
 */
import type Stripe from "stripe";

import { newPrice } from "@/modules/billing/domain/price";
import { newProduct } from "@/modules/billing/domain/product";
import { BillingProvider } from "@/modules/billing/domain/provider";
import { BILLING_CURRENCY } from "@/modules/billing/infrastructure/billing-config";
import { getStripe } from "@/modules/billing/infrastructure/stripe-client";
import { SupabaseBillingRepository } from "@/modules/billing/infrastructure/supabase-billing-repository";
import { createAdminClient } from "@/shared/supabase/admin";

// ── Product ────────────────────────────────────────────────────────────────
const SEED_PRODUCT_ID = "premium";
const PRODUCT_NAME = "Premium";
const PRODUCT_DESCRIPTION = "Acesso completo ao Evhora.";
const PRODUCT_FEATURES = [
  "Projetos ilimitados",
  "Suporte prioritário",
  "Recursos avançados",
  "30 dias grátis para testar",
];
const PRODUCT_METADATA: Record<string, string> = {
  seed_id: SEED_PRODUCT_ID,
  tier_order: "1",
  highlighted: "true",
  features: JSON.stringify(PRODUCT_FEATURES),
};

// ── Prices ─────────────────────────────────────────────────────────────────
interface PriceSeed {
  seedId: string;
  amountCents: number;
  interval: Stripe.Price.Recurring.Interval;
}

const PRICES: PriceSeed[] = [
  { seedId: "premium_monthly", amountCents: 2900, interval: "month" },
  { seedId: "premium_yearly", amountCents: 29990, interval: "year" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
async function findProductBySeedId(
  stripe: Stripe,
  seedId: string,
): Promise<Stripe.Product | null> {
  try {
    const result = await stripe.products.search({
      query: `metadata['seed_id']:'${seedId}'`,
      limit: 1,
    });
    if (result.data[0]) return result.data[0];
  } catch {
    // fall through to list-based scan
  }
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (product.metadata?.seed_id === seedId) return product;
  }
  return null;
}

async function upsertStripeProduct(stripe: Stripe): Promise<Stripe.Product> {
  const existing = await findProductBySeedId(stripe, SEED_PRODUCT_ID);
  if (existing) {
    console.log(`[seed] updating existing product ${existing.id}`);
    return stripe.products.update(existing.id, {
      name: PRODUCT_NAME,
      description: PRODUCT_DESCRIPTION,
      active: true,
      metadata: PRODUCT_METADATA,
    });
  }
  console.log("[seed] creating new product");
  return stripe.products.create({
    name: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    active: true,
    metadata: PRODUCT_METADATA,
  });
}

async function upsertStripePrice(
  stripe: Stripe,
  productId: string,
  seed: PriceSeed,
): Promise<Stripe.Price> {
  const allPrices: Stripe.Price[] = [];
  for await (const p of stripe.prices.list({
    product: productId,
    limit: 100,
  })) {
    allPrices.push(p);
  }

  const matching = allPrices.find(
    (p) =>
      p.active &&
      p.currency === BILLING_CURRENCY &&
      p.unit_amount === seed.amountCents &&
      p.recurring?.interval === seed.interval &&
      (p.recurring?.interval_count ?? 1) === 1,
  );

  if (matching) {
    console.log(
      `[seed] reusing existing price ${matching.id} (${seed.interval})`,
    );
    if (matching.metadata?.seed_id !== seed.seedId) {
      return stripe.prices.update(matching.id, {
        metadata: { seed_id: seed.seedId },
      });
    }
    return matching;
  }

  for (const p of allPrices) {
    if (
      p.active &&
      p.currency === BILLING_CURRENCY &&
      p.recurring?.interval === seed.interval
    ) {
      console.log(`[seed] deactivating stale price ${p.id} (${seed.interval})`);
      await stripe.prices.update(p.id, { active: false });
    }
  }

  console.log(`[seed] creating new price (${seed.interval})`);
  return stripe.prices.create({
    product: productId,
    currency: BILLING_CURRENCY,
    unit_amount: seed.amountCents,
    recurring: { interval: seed.interval },
    metadata: { seed_id: seed.seedId },
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const stripe = getStripe();
  const admin = createAdminClient();
  const billing = new SupabaseBillingRepository(admin as never);

  const stripeProduct = await upsertStripeProduct(stripe);

  await billing.upsertProduct(
    newProduct({
      id: stripeProduct.id,
      provider: BillingProvider.STRIPE,
      active: stripeProduct.active,
      name: stripeProduct.name,
      description: stripeProduct.description ?? "",
      features: PRODUCT_FEATURES,
      metadata: (stripeProduct.metadata ?? {}) as Record<string, string>,
    }),
  );

  console.log(`[seed] product: ${stripeProduct.id} (${stripeProduct.name})`);

  for (const seed of PRICES) {
    const stripePrice = await upsertStripePrice(stripe, stripeProduct.id, seed);

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
        interval: stripePrice.recurring?.interval ?? "",
      }),
    );

    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format((stripePrice.unit_amount ?? 0) / 100);

    console.log(
      `[seed] price (${seed.interval}): ${stripePrice.id} — ${formatted}/${seed.interval}`,
    );
  }

  console.log("[seed] done");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
