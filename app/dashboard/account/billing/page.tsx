import { timestampDate } from "@bufbuild/protobuf/wkt";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BillingSummary,
  type BillingSummaryData,
  CancelSubscriptionButton,
  ChangePlanDialog,
  type ChangePlanOption,
  getCurrentSubscription,
  InvoiceList,
  isPriceVisibleToUser,
  ResumeSubscriptionButton,
  subscriptionStatusToString,
  UpdatePaymentMethodDialog,
} from "@/modules/billing";
import { BILLING_CURRENCY } from "@/modules/billing/infrastructure/billing-config";
import { tryBuildCtx } from "@/shared/context";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

export default async function BillingPage() {
  const ctx = await tryBuildCtx();
  if (!ctx) redirect("/auth/login");

  const t = await getTranslations();

  const [subscription, prices, products] = await Promise.all([
    getCurrentSubscription({ userId: ctx.userId, billing: ctx.billing }),
    ctx.billing.listActivePricesByCurrency(BILLING_CURRENCY),
    ctx.billing.listActiveProducts(),
  ]);

  if (!subscription) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t("pages.billing.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("pages.billing.description")}
            </p>
          </div>
          <Alert>
            <AlertTitle>{t("pages.billing.noSubscription.title")}</AlertTitle>
            <AlertDescription>
              {t("pages.billing.noSubscription.description")}
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/pricing">
              {t("pages.billing.noSubscription.cta")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusString = subscriptionStatusToString(subscription.status);

  const currentPrice =
    prices.find((p) => p.id === subscription.priceId) ?? null;
  const currentProduct = currentPrice
    ? (products.find((p) => p.id === currentPrice.productId) ?? null)
    : null;

  const summaryData: BillingSummaryData = {
    status: statusString,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    planName: currentProduct?.name ?? t("pages.billing.freePlan"),
    planDescription: currentProduct?.description ?? null,
    unitAmount:
      currentPrice?.unitAmount != null ? Number(currentPrice.unitAmount) : null,
    currency: currentPrice?.currency ?? BILLING_CURRENCY,
    interval: currentPrice?.interval || null,
    currentPeriodEnd: subscription.currentPeriodEnd
      ? timestampDate(subscription.currentPeriodEnd).toISOString()
      : null,
    trialEnd: subscription.trialEnd
      ? timestampDate(subscription.trialEnd).toISOString()
      : null,
  };

  // Hide prices restricted to other users from the change-plan dropdown. The
  // user's currently-subscribed price is always visible even if it became
  // restricted after subscription — they wouldn't be able to pick it again,
  // but they need to see it as the current selection.
  const changePlanOptions: ChangePlanOption[] = prices
    .filter(
      (price) =>
        price.id === subscription.priceId ||
        isPriceVisibleToUser(price, ctx.userId),
    )
    .map((price) => ({
      priceId: price.id,
      productName:
        products.find((p) => p.id === price.productId)?.name ?? price.id,
      unitAmount: price.unitAmount != null ? Number(price.unitAmount) : null,
      currency: price.currency,
      interval: price.interval || null,
    }));

  const isInactive = statusString === "inactive";
  const isCanceling = subscription.cancelAtPeriodEnd;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("pages.billing.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pages.billing.description")}
          </p>
        </div>

        {isInactive ? (
          <Alert>
            <AlertTitle>{t("pages.billing.inactiveBanner.title")}</AlertTitle>
            <AlertDescription>
              {t("pages.billing.inactiveBanner.description")}
            </AlertDescription>
          </Alert>
        ) : null}

        <BillingSummary data={summaryData} />

        <div className="flex flex-wrap gap-2">
          {isInactive ? (
            <Button asChild>
              <Link href="/pricing">
                {t("pages.billing.noSubscription.cta")}
              </Link>
            </Button>
          ) : (
            <>
              {isCanceling ? (
                <ResumeSubscriptionButton />
              ) : (
                <CancelSubscriptionButton />
              )}
              <ChangePlanDialog
                options={changePlanOptions}
                currentPriceId={subscription.priceId || null}
              />
              <UpdatePaymentMethodDialog />
            </>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            {t("pages.billing.invoices.title")}
          </h2>
          <InvoiceList />
        </div>
      </div>
    </div>
  );
}
