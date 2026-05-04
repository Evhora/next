import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PauseCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buildCtx } from "@/shared/context";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Separator } from "@/shared/ui/separator";

import { getDreamProgress } from "../application/get-dream-progress";
import { listDreamsForUser } from "../application/list-dreams-for-user";
import { Dream_DreamStatus } from "../domain/dream";

import { DreamsTable } from "./dreams-table";
import { NewDreamDialog } from "./new-dream-dialog";

export async function DreamsPage() {
  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);
  const [dreams, progress] = await Promise.all([
    listDreamsForUser(ctx),
    getDreamProgress(ctx),
  ]);

  const inProgressCount = dreams.filter(
    (d) => d.status === Dream_DreamStatus.IN_PROGRESS,
  ).length;
  const completedCount = dreams.filter(
    (d) => d.status === Dream_DreamStatus.COMPLETED,
  ).length;
  const pausedCount = dreams.filter(
    (d) => d.status === Dream_DreamStatus.PAUSED,
  ).length;
  const progressNumber =
    dreams.length === 0
      ? 0
      : Math.round((completedCount / dreams.length) * 100);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 30);

  const urgentDreams = dreams
    .filter((d) => {
      if (!d.deadline || d.status === Dream_DreamStatus.COMPLETED) return false;
      return new Date(d.deadline) <= soon;
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      {/* Page header */}
      <div
        className="flex items-center justify-between duration-700 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex items-center gap-3">
          <Target className="size-7 text-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("pages.dreams.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("pages.dreams.description")}
            </p>
          </div>
        </div>
        <NewDreamDialog
          trigger={<Button>+ {t("pages.dreams.newDream")}</Button>}
        />
      </div>

      <Separator />

      {dreams.length === 0 ? (
        <Card className="flex-1">
          <Empty>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t("pages.dreams.empty.message")}</EmptyTitle>
              <EmptyDescription>
                {t("pages.dreams.description")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <NewDreamDialog
                trigger={<Button>+ {t("pages.dreams.newDream")}</Button>}
              />
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div
            className="grid grid-cols-2 gap-4 duration-700 animate-in fade-in slide-in-from-bottom-2 lg:grid-cols-4"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            <Card>
              <CardHeader>
                <CardDescription>Total de sonhos</CardDescription>
                <CardTitle className="text-4xl tabular-nums">
                  {dreams.length}
                </CardTitle>
                <CardAction>
                  <Target className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">
                  {progressNumber}% concluídos
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Em andamento</CardDescription>
                <CardTitle className="text-4xl tabular-nums text-amber-500">
                  {inProgressCount}
                </CardTitle>
                <CardAction>
                  <Clock className="size-4 text-amber-500" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={inProgressCount}
                  max={dreams.length}
                  color="bg-amber-500"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Concluídos</CardDescription>
                <CardTitle className="text-4xl tabular-nums text-primary">
                  {completedCount}
                </CardTitle>
                <CardAction>
                  <CheckCircle2 className="size-4 text-primary" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={completedCount}
                  max={dreams.length}
                  color="bg-primary"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Pausados</CardDescription>
                <CardTitle className="text-4xl tabular-nums text-muted-foreground">
                  {pausedCount}
                </CardTitle>
                <CardAction>
                  <PauseCircle className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={pausedCount}
                  max={dreams.length}
                  color="bg-muted-foreground"
                />
              </CardContent>
            </Card>
          </div>

          {/* Overall progress card */}
          <Card
            className="duration-700 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: "250ms", animationFillMode: "both" }}
          >
            <CardHeader>
              <CardDescription>Progresso geral</CardDescription>
              <CardTitle className="text-4xl tabular-nums text-primary">
                {progressNumber}%
              </CardTitle>
              <CardAction>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min(progressNumber, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {completedCount} de {dreams.length} sonhos concluídos
              </p>
            </CardContent>
          </Card>

          {/* Urgent deadlines */}
          {urgentDreams.length > 0 && (
            <Card
              className="border-amber-200 bg-amber-50/50 duration-700 animate-in fade-in slide-in-from-bottom-2 dark:border-amber-900/40 dark:bg-amber-950/10"
              style={{ animationDelay: "350ms", animationFillMode: "both" }}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                    Prazos próximos (30 dias)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {urgentDreams.map((d) => {
                    const dl = new Date(d.deadline);
                    const diffDays = Math.ceil(
                      (dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    );
                    const overdue = diffDays < 0;
                    return (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-2.5"
                      >
                        <span className="text-sm font-medium leading-none">
                          {d.title}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-semibold tabular-nums ${
                            overdue
                              ? "text-destructive"
                              : diffDays <= 7
                                ? "text-amber-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {overdue
                            ? `${Math.abs(diffDays)}d atrasado`
                            : diffDays === 0
                              ? "hoje"
                              : `${diffDays}d`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div
            className="duration-700 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            <DreamsTable dreams={dreams} progress={progress} />
          </div>
        </>
      )}
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
