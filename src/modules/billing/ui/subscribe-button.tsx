"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

import { startCheckoutAction } from "./actions";

type Props = {
  priceId: string;
  label: string;
  highlighted?: boolean;
};

export function SubscribeButton({ priceId, label, highlighted }: Props) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  async function handleClick() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("priceId", priceId);
      const result = await startCheckoutAction(null, formData);
      if (!result.ok) throw new Error(result.message);
      window.location.href = result.data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toast.error(t("pages.pricing.checkoutError"), { description: message });
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      variant={highlighted ? "default" : "outline"}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? t("common.loading") : label}
    </Button>
  );
}
