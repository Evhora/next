import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  getCurrentSubscription,
  isPriceVisibleToUser,
  PricingCard,
  type PricingPlan,
} from "@/modules/billing";
import { BILLING_CURRENCY } from "@/modules/billing/infrastructure/billing-config";
import { tryBuildCtx } from "@/shared/context";

export default async function PricingPage() {
  const t = await getTranslations();

  return (
    <main className="flex h-screen flex-col overflow-hidden px-6">
      <section className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("pages.pricing.title")}
          </h1>

          <p className="mt-3 text-lg text-muted-foreground">
            {t("pages.pricing.subtitle")}
          </p>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center pb-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl rounded-xl border border-dashed p-16 text-center text-sm text-muted-foreground">
              …
            </div>
          }
        >
          <PricingPlans />
        </Suspense>
      </section>
    </main>
  );
}

async function PricingPlans() {
  const t = await getTranslations();
  const ctx = await tryBuildCtx();

  if (ctx) {
    const sub = await getCurrentSubscription({
      userId: ctx.userId,
      billing: ctx.billing,
    });
    if (sub) redirect("/dashboard");
  }

  // Prices/products are public catalog data — use an unauthenticated-friendly
  // path when no ctx is available by building one from a fresh supabase client
  // read. Anonymous visitors still need to see the catalog.
  const { createClient } = await import("@/shared/supabase/server");
  const { SupabaseBillingRepository } = await import(
    "@/modules/billing/infrastructure/supabase-billing-repository"
  );
  const supabase = await createClient();
  const billingRead = ctx?.billing ?? new SupabaseBillingRepository(supabase);

  const [products, allPrices] = await Promise.all([
    billingRead.listActiveProducts(),
    billingRead.listActivePricesByCurrency(BILLING_CURRENCY),
  ]);

  // Hide prices restricted to other users. Anonymous visitors (no `userId`)
  // only see public prices.
  const prices = allPrices.filter((p) =>
    isPriceVisibleToUser(p, ctx?.userId ?? null),
  );

  const plans: PricingPlan[] = products
    .flatMap((product) =>
      prices
        .filter((p) => p.productId === product.id)
        .map((price) => ({
          productId: product.id,
          priceId: price.id,
          name: product.name,
          description: product.description || null,
          unitAmount:
            price.unitAmount != null ? Number(price.unitAmount) : null,
          currency: price.currency,
          interval: price.interval || null,
          features: [...product.features],
          highlighted: price.interval === "year",
        })),
    )
    .sort((a) => (a.interval === "year" ? 1 : -1));

  if (plans.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-dashed p-16 text-center text-sm text-muted-foreground">
        {t("pages.pricing.empty")}
      </div>
    );
  }

  const monthlyPlan = plans.find((p) => p.interval === "month");
  const yearlyPlan = plans.find((p) => p.interval === "year");

  const savingsPct =
    monthlyPlan?.unitAmount && yearlyPlan?.unitAmount
      ? Math.round(
          (1 - yearlyPlan.unitAmount / (monthlyPlan.unitAmount * 12)) * 100,
        )
      : null;

  const yearlyMonthlyEquiv =
    yearlyPlan?.unitAmount != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: BILLING_CURRENCY.toUpperCase(),
        }).format(yearlyPlan.unitAmount / 100 / 12)
      : null;

  return (
    <>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 pt-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <PricingCard
            key={plan.priceId}
            plan={plan}
            isAuthenticated={Boolean(ctx)}
            ctaLabel={
              plan.highlighted
                ? t("pages.pricing.subscribeCta")
                : t("pages.pricing.subscribe")
            }
            signUpLabel={t("pages.pricing.signUpToSubscribe")}
            perMonthLabel={t("pages.pricing.perMonth")}
            perYearLabel={t("pages.pricing.perYear")}
            billedYearlyLabel={t("pages.pricing.billedYearly")}
            billedMonthlyLabel={t("pages.pricing.billedMonthly")}
            recommendedLabel={
              plan.highlighted ? t("pages.pricing.recommended") : undefined
            }
            savingsBadge={
              plan.highlighted && savingsPct != null
                ? t("pages.pricing.savingsBadge", { percent: savingsPct })
                : undefined
            }
            monthlyEquivalentLabel={
              plan.highlighted && yearlyMonthlyEquiv
                ? t("pages.pricing.monthlyEquivalent", {
                    price: yearlyMonthlyEquiv,
                  })
                : undefined
            }
          />
        ))}
      </div>

      <TrustBar />
    </>
  );
}

async function TrustBar() {
  const t = await getTranslations();

  return (
    <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
      <TrustItem emoji="✓" label={t("pages.pricing.trustCancel")} />
    </div>
  );
}

function TrustItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
    </div>
  );
}
