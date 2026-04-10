import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { tryBuildCtx } from "@/shared/context";
import { Card, CardContent } from "@/shared/ui/card";

import { getDashboardSummary } from "../application/getDashboardSummary";

import { DashboardSkeleton } from "./DashboardSkeleton";
import { GreetingCard } from "./GreetingCard";
import { ProgressByAreaCard } from "./ProgressByAreaCard";

/**
 * /dashboard — Server Component. Streams a skeleton while the summary use
 * case fetches dreams + actions + sentences in parallel.
 */
export function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const ctx = await tryBuildCtx();
  if (!ctx) redirect("/auth/login");

  const t = await getTranslations();
  const summary = await getDashboardSummary(ctx);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const motivationalSentence =
    summary.motivationalSentence ??
    t("pages.dashboard.greeting.defaultMotivational");

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <GreetingCard
          username={ctx.user.displayName}
          date={formattedDate}
          motivationalSentence={motivationalSentence}
        />

        <SummarySection
          title={t("pages.dreams.title")}
          stats={[
            {
              label: t("pages.dreams.stats.totalDreams"),
              value: summary.dreams.total,
            },
            {
              label: t("pages.dreams.stats.completedDreams"),
              value: summary.dreams.completed,
            },
            {
              label: t("pages.dreams.stats.progressPercent"),
              value: `${summary.dreams.progressPercent}%`,
            },
          ]}
        />

        <SummarySection
          title={t("pages.actions.title")}
          stats={[
            {
              label: t("pages.actions.stats.totalActions"),
              value: summary.actions.total,
            },
            {
              label: t("pages.actions.stats.completedActions"),
              value: summary.actions.completed,
            },
            {
              label: t("pages.actions.stats.progressPercent"),
              value: `${summary.actions.progressPercent}%`,
            },
          ]}
        />

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("pages.dashboard.progress.todayActions")}
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dashboard.progress.completed", {
                  completed: summary.todayActions.completed,
                  total: summary.todayActions.total,
                })}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {summary.todayActions.completed} / {summary.todayActions.total}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{
                    width: `${Math.min(summary.todayActions.progress, 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <ProgressByAreaCard areas={summary.progressByArea} />
      </div>
    </div>
  );
}

interface SummarySectionProps {
  title: string;
  stats: { label: string; value: string | number }[];
}

function SummarySection({ title, stats }: SummarySectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
