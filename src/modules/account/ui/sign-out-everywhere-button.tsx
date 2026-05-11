"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";
import { createClient } from "@/shared/supabase/client";

export function SignOutEverywhereButton() {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
      router.push("/auth/login");
    });
  }

  return (
    <Button variant="outline" disabled={isPending} onClick={handleClick}>
      {isPending
        ? t("pages.account.security.signingOut")
        : t("pages.account.security.signOutEverywhere")}
    </Button>
  );
}
