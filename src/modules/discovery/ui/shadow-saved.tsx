"use client";

import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ShadowSaved() {
  const t = useTranslations();
  const startNewDiscovery = () => {
    // Hard nav: we're already on /dashboard/discovery, so a soft Link wouldn't
    // remount QuizShell. Full reload forces startSession() to run server-side
    // and create a fresh session (previous one is COMPLETED).
    window.location.href = "/dashboard/discovery";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center text-center gap-6 max-w-md mx-auto py-12"
    >
      <Moon className="w-12 h-12 text-purple-300" />

      <h2 className="text-2xl font-serif text-white">
        {t("pages.discovery.shadowSaved.title")}
      </h2>

      <p className="text-white/60 text-base leading-relaxed">
        {t("pages.discovery.shadowSaved.description")}
      </p>

      <p className="text-white/40 text-sm">
        {t("pages.discovery.shadowSaved.subtext")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button asChild className="bg-white text-black hover:bg-white/90 gap-2">
          <Link href="/dashboard/dreams">
            {t("pages.discovery.shadowSaved.viewDream")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>

        <Button
          onClick={startNewDiscovery}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 gap-2 border border-white/20"
        >
          <Compass className="w-4 h-4" />
          {t("pages.discovery.shadowSaved.startNew")}
        </Button>
      </div>
    </motion.div>
  );
}
