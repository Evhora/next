import { getTranslations } from "next-intl/server";

import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export type BillingSummaryData = {
  status: string;
  cancelAtPeriodEnd: boolean;
  planName: string;
  planDescription: string | null;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export async function BillingSummary({ data }: { data: BillingSummaryData }) {
  const t = await getTranslations();

  const statusLabelKey = (() => {
    switch (data.status) {
      case "trialing":
        return "pages.billing.status.trialing";
      case "active":
        return "pages.billing.status.active";
      case "inactive":
        return "pages.billing.status.inactive";
      default:
        return "pages.billing.status.inactive";
    }
  })();

  const badgeVariant: "default" | "secondary" | "destructive" =
    data.status === "inactive" ? "secondary" : "default";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{data.planName}</CardTitle>
            {data.planDescription ? (
              <CardDescription>{data.planDescription}</CardDescription>
            ) : null}
          </div>
          <Badge variant={badgeVariant}>{t(statusLabelKey)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {t("pages.billing.price")}
          </span>
          <span className="font-medium">
            {formatPrice(data.unitAmount, data.currency)}
            {data.interval
              ? ` / ${t(
                  data.interval === "year"
                    ? "pages.billing.year"
                    : "pages.billing.month",
                )}`
              : ""}
          </span>
        </div>
        {data.status === "trialing" && data.trialEnd ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("pages.billing.trialEnds")}
            </span>
            <span className="font-medium">{formatDate(data.trialEnd)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {data.cancelAtPeriodEnd
              ? t("pages.billing.endsOn")
              : t("pages.billing.nextBilling")}
          </span>
          <span className="font-medium">
            {formatDate(data.currentPeriodEnd)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
