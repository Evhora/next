"use client";

import { useTranslations } from "next-intl";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import { DREAM_AREA_OF_LIFE_LABELS } from "@/modules/dreams/domain/labels";

interface AreaProgress {
  area: Dream_DreamAreaOfLife;
  percentage: number;
}

interface ProgressByAreaCardProps {
  areas: AreaProgress[];
}

const areaIcon: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "·",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "🧘",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "👨‍👩‍👧‍👦",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "💪",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "💼",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "✨",
};

export function ProgressByAreaCard({ areas }: ProgressByAreaCardProps) {
  const t = useTranslations();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-7 pb-2 pt-7 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
        {t("pages.dashboard.progress.progressByArea")}
      </p>

      <div className="mt-6">
        {areas.map(({ area, percentage }) => {
          const icon = areaIcon[area] ?? "·";
          const labelKey =
            `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as
              | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
              | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
              | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
              | "enums.dream.areaOfLife.SPIRITUALITY"
              | "enums.dream.areaOfLife.LIFESTYLE";

          return (
            <div
              key={area}
              className="group flex items-center gap-5 border-b border-zinc-100 py-4 last:border-0 dark:border-zinc-800"
            >
              <span className="w-5 shrink-0 text-base leading-none">
                {icon}
              </span>
              <span className="w-44 shrink-0 truncate text-sm text-zinc-600 dark:text-zinc-400">
                {t(labelKey)}
              </span>
              <div className="relative flex-1">
                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />
                <div
                  className="absolute inset-y-0 left-0 h-px bg-rose-500 transition-all duration-700 dark:bg-rose-400"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
