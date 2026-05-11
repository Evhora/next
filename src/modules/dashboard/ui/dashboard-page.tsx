import { LayoutDashboard, ListChecks, Target, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { tryBuildCtx } from "@/shared/context";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import { getDashboardSummary } from "../application/get-dashboard-summary";

import { DashboardSkeleton } from "./dashboard-skeleton";
import { ProgressByAreaCard } from "./progress-by-area-card";

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
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      {/* Page header */}
      <div
        className="flex items-center gap-3 duration-700 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationFillMode: "both" }}
      >
        <LayoutDashboard className="size-7 text-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pages.dashboard.greeting.hello", {
              username: ctx.user.displayName,
            })}
          </h1>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <Separator />

      {/* Motivational quote */}
      <p
        className="text-sm italic text-muted-foreground duration-700 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        {motivationalSentence}
      </p>

      {/* KPI row */}
      <div
        className="grid grid-cols-2 gap-4 duration-700 animate-in fade-in slide-in-from-bottom-2 lg:grid-cols-4"
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.dreams.stats.totalDreams")}
            </CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {summary.dreams.total}
            </CardTitle>
            <CardAction>
              <Target className="size-4 text-purple-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={summary.dreams.completed}
              max={summary.dreams.total}
              color="bg-purple-500"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.dreams.progressPercent}%{" "}
              {t("pages.dreams.stats.completedDreams").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.actions.stats.totalActions")}
            </CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {summary.actions.total}
            </CardTitle>
            <CardAction>
              <ListChecks className="size-4 text-purple-400" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={summary.actions.completed}
              max={summary.actions.total}
              color="bg-purple-400"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.actions.progressPercent}%{" "}
              {t("pages.actions.stats.completedActions").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Progresso geral</CardDescription>
            <CardTitle className="text-4xl tabular-nums text-purple-600">
              {summary.dreams.progressPercent}%
            </CardTitle>
            <CardAction>
              <TrendingUp className="size-4 text-purple-600" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={summary.dreams.completed}
              max={summary.dreams.total}
              color="bg-purple-600"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.dreams.completed} de {summary.dreams.total} sonhos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress by area */}
      <div
        className="duration-700 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: "400ms", animationFillMode: "both" }}
      >
        <ProgressByAreaCard areas={summary.progressByArea} />
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
