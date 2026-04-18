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

const areaIcons: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "📌",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "🧘",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "👨‍👩‍👧‍👦",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "💪",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "💼",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "✨",
};

export function ProgressByAreaCard({ areas }: ProgressByAreaCardProps) {
  const t = useTranslations();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("pages.dashboard.progress.progressByArea")}
      </h3>
      <div className="space-y-4">
        {areas.map(({ area, percentage }) => (
          <div key={area} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{areaIcons[area] || "📌"}</span>
                <span className="text-sm font-medium text-foreground">
                  {t(
                    `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as
                      | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                      | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                      | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                      | "enums.dream.areaOfLife.SPIRITUALITY"
                      | "enums.dream.areaOfLife.LIFESTYLE",
                  )}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {percentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
