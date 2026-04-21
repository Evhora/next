"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { changePlanAction } from "./actions";

export type ChangePlanOption = {
  priceId: string;
  productName: string;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
};

function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function ChangePlanDialog({
  options,
  currentPriceId,
}: {
  options: ChangePlanOption[];
  currentPriceId: string | null;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const alternatives = options.filter((o) => o.priceId !== currentPriceId);

  async function handleChoose(priceId: string) {
    setLoadingId(priceId);
    try {
      const formData = new FormData();
      formData.set("priceId", priceId);
      const result = await changePlanAction(null, formData);
      if (!result.ok) throw new Error(result.message);
      toast.success(t("pages.billing.changePlan.success"));
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Change plan failed";
      toast.error(t("pages.billing.changePlan.error"), {
        description: message,
      });
    } finally {
      setLoadingId(null);
    }
  }

  if (alternatives.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {t("pages.billing.changePlan.button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.billing.changePlan.title")}</DialogTitle>
          <DialogDescription>
            {t("pages.billing.changePlan.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {alternatives.map((opt) => (
            <div
              key={opt.priceId}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <div className="font-medium">{opt.productName}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(opt.unitAmount, opt.currency)}
                  {opt.interval
                    ? ` / ${t(
                        opt.interval === "year"
                          ? "pages.billing.year"
                          : "pages.billing.month",
                      )}`
                    : ""}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleChoose(opt.priceId)}
                disabled={loadingId !== null}
              >
                {loadingId === opt.priceId
                  ? t("common.loading")
                  : t("pages.billing.changePlan.choose")}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
