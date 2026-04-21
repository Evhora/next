import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/ui/card";
import { cn } from "@/shared/utils";

import { SubscribeButton } from "./subscribe-button";

export type PricingPlan = {
  productId: string;
  priceId: string;
  name: string;
  description: string | null;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  features: string[];
  highlighted?: boolean;
};

function formatPrice(
  amount: number | null,
  currency: string,
  opts?: { compact?: boolean },
) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: opts?.compact ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

type Props = {
  plan: PricingPlan;
  isAuthenticated: boolean;
  ctaLabel: string;
  signUpLabel: string;
  perMonthLabel: string;
  perYearLabel: string;
  billedYearlyLabel: string;
  billedMonthlyLabel: string;
  recommendedLabel?: string;
  savingsBadge?: string;
  monthlyEquivalentLabel?: string;
};

export function PricingCard({
  plan,
  isAuthenticated,
  ctaLabel,
  signUpLabel,
  perMonthLabel,
  perYearLabel,
  billedYearlyLabel,
  billedMonthlyLabel,
  recommendedLabel,
  savingsBadge,
  monthlyEquivalentLabel,
}: Props) {
  const isYearly = plan.interval === "year";
  const billingLabel = isYearly ? billedYearlyLabel : billedMonthlyLabel;

  return (
    <div className={cn("relative flex flex-col", plan.highlighted && "mt-0")}>
      {plan.highlighted && recommendedLabel ? (
        <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            {recommendedLabel}
          </span>
        </div>
      ) : null}

      <Card
        className={cn(
          "flex flex-1 flex-col transition-shadow duration-200 hover:shadow-md",
          plan.highlighted
            ? "border-primary shadow-lg ring-1 ring-primary"
            : "border-border",
        )}
      >
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {plan.name}
              </p>
              {plan.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  {plan.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-end gap-2">
              <span
                className={cn(
                  "font-bold leading-none tracking-tight",
                  plan.highlighted ? "text-5xl" : "text-4xl",
                )}
              >
                {formatPrice(plan.unitAmount, plan.currency)}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                {isYearly ? perYearLabel : perMonthLabel}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isYearly && monthlyEquivalentLabel ? (
                <span className="text-sm text-muted-foreground">
                  {monthlyEquivalentLabel}
                </span>
              ) : null}

              {savingsBadge ? (
                <Badge
                  variant="secondary"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {savingsBadge}
                </Badge>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">{billingLabel}</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-6">
          {plan.features.length > 0 ? (
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>

        <CardFooter className="pt-0">
          {isAuthenticated ? (
            <SubscribeButton
              priceId={plan.priceId}
              label={ctaLabel}
              highlighted={plan.highlighted}
            />
          ) : (
            <Button
              asChild
              className="w-full"
              variant={plan.highlighted ? "default" : "outline"}
              size="lg"
            >
              <Link href="/auth/sign-up?next=/pricing">{signUpLabel}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
