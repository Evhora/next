"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

import { resumeSubscriptionAction } from "./actions";

export function ResumeSubscriptionButton() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await resumeSubscriptionAction();
      if (!result.ok) throw new Error(result.message);
      toast.success(t("pages.billing.resume.success"));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Resume failed";
      toast.error(t("pages.billing.resume.error"), { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? t("common.loading") : t("pages.billing.resume.button")}
    </Button>
  );
}
