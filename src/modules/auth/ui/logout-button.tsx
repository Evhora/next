"use client";

import { Button } from "@/shared/ui/button";
import { createClient } from "@/shared/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>{t("common.logout")}</Button>;
}
