"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Heart, Leaf, Minus, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import { DREAM_AREA_OF_LIFE_LABELS } from "@/modules/dreams/domain/labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface AreaProgress {
  area: Dream_DreamAreaOfLife;
  percentage: number;
}

interface ProgressByAreaCardProps {
  areas: AreaProgress[];
}

const AREA_ICON: Record<Dream_DreamAreaOfLife, LucideIcon | null> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: null,
  [Dream_DreamAreaOfLife.SPIRITUALITY]: Leaf,
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: Users,
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: Heart,
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: Briefcase,
  [Dream_DreamAreaOfLife.LIFESTYLE]: Sparkles,
};

const AREA_COLOR: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "text-muted-foreground",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "text-green-400",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "text-purple-500",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "text-red-500",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "text-orange-400",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "text-yellow-500",
};

const AREA_BAR: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "bg-primary",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "bg-purple-400",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "bg-purple-500",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "bg-orange-500",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "bg-orange-400",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "bg-purple-600",
};

export function ProgressByAreaCard({ areas }: ProgressByAreaCardProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {t("pages.dashboard.progress.progressByArea")}
        </CardDescription>
        <CardTitle className="sr-only">
          {t("pages.dashboard.progress.progressByArea")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {areas.map(({ area, percentage }) => {
            const Icon = AREA_ICON[area];
            const iconColor = AREA_COLOR[area];
            const barColor = AREA_BAR[area];
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
                className="flex items-center gap-4 border-b py-3 last:border-0"
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {Icon ? (
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </span>
                <span className="w-40 shrink-0 truncate text-sm text-muted-foreground">
                  {t(labelKey)}
                </span>
                <div className="relative flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-semibold tabular-nums text-foreground">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
