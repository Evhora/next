"use client";

import { useTranslations } from "next-intl";

interface AreaProgress {
  area: string;
  percentage: number;
}

interface ProgressByAreaCardProps {
  areas: AreaProgress[];
}

const areaIcons: Record<string, string> = {
  SPIRITUALITY: "🧘",
  FAMILY_AND_RELANTIONSHIP: "👨‍👩‍👧‍👦",
  HEALTH_AND_WELL_BEING: "💪",
  BUSINESS_AND_FINANCE: "💼",
  LIFESTYLE: "✨",
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
                  {t(`enums.dream.areaOfLife.${area}` as any) || area}
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
