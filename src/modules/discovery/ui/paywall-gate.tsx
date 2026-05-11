"use client";

import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function PaywallGate() {
  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center gap-6 max-w-md mx-auto py-12"
    >
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-white/60" />
      </div>

      <h2 className="text-2xl font-serif text-white">
        {t("pages.discovery.paywall.title")}
      </h2>

      <p className="text-white/60 text-base leading-relaxed">
        {t("pages.discovery.paywall.description")}
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Button
          asChild
          className="bg-white text-black hover:bg-white/90 w-full"
        >
          <Link href="/dashboard/account/billing">
            {t("pages.discovery.paywall.unlock")}
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="text-secondary hover:text-secondary-foreground w-full"
          asChild
        >
          <Link href="/dashboard">{t("pages.discovery.paywall.back")}</Link>
        </Button>
      </div>
    </motion.div>
  );
}
