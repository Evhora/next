import {
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
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
            <CardDescription>
              {t("pages.dashboard.progress.todayActions")}
            </CardDescription>
            <CardTitle className="text-4xl tabular-nums text-orange-500">
              {summary.todayActions.completed}
              <span className="text-xl font-normal text-muted-foreground">
                /{summary.todayActions.total}
              </span>
            </CardTitle>
            <CardAction>
              <Zap className="size-4 text-orange-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={summary.todayActions.completed}
              max={summary.todayActions.total}
              color="bg-orange-500"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.todayActions.progress}%{" "}
              {t("pages.dashboard.progress.completed", {
                completed: summary.todayActions.completed,
                total: summary.todayActions.total,
              }).toLowerCase()}
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

      {/* Domain cards */}
      <div
        className="grid gap-4 duration-700 animate-in fade-in slide-in-from-bottom-2 lg:grid-cols-2"
        style={{ animationDelay: "300ms", animationFillMode: "both" }}
      >
        <Card>
          <CardHeader>
            <CardDescription>{t("pages.dreams.title")}</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {summary.dreams.total}
            </CardTitle>
            <CardAction>
              <Link
                href="/dashboard/dreams"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Ver todos
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-purple-500" />
                {summary.dreams.completed} concluídos
              </span>
              <span className="font-semibold tabular-nums text-purple-500">
                {summary.dreams.progressPercent}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-700"
                style={{
                  width: `${Math.min(summary.dreams.progressPercent, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("pages.actions.title")}</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {summary.actions.total}
            </CardTitle>
            <CardAction>
              <Link
                href="/dashboard/actions"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Ver todos
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-purple-400" />
                {summary.actions.completed} concluídas
              </span>
              <span className="font-semibold tabular-nums text-purple-400">
                {summary.actions.progressPercent}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-purple-400 transition-all duration-700"
                style={{
                  width: `${Math.min(summary.actions.progressPercent, 100)}%`,
                }}
              />
            </div>
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
