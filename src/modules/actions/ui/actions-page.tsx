import { CheckCircle2, Clock, ListChecks, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { listDreamsForUser } from "@/modules/dreams/application/list-dreams-for-user";
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

import { listActionsForUser } from "../application/list-actions-for-user";
import { Action_ActionStatus } from "../domain/action";

import { ActionsTable } from "./actions-table";
import { NewActionDialog } from "./new-action-dialog";

export async function ActionsPage() {
  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);
  const [actions, dreams] = await Promise.all([
    listActionsForUser(ctx),
    listDreamsForUser(ctx),
  ]);

  const completedCount = actions.filter(
    (a) => a.status === Action_ActionStatus.COMPLETED,
  ).length;
  const inProgressCount = actions.filter(
    (a) => a.status === Action_ActionStatus.IN_PROGRESS,
  ).length;
  const progressNumber =
    actions.length === 0
      ? 0
      : Math.round((completedCount / actions.length) * 100);

  const dreamOptions = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      {/* Page header */}
      <div
        className="flex items-center justify-between duration-700 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex items-center gap-3">
          <ListChecks className="size-7 text-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("pages.actions.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("pages.actions.description")}
            </p>
          </div>
        </div>
        <NewActionDialog
          dreams={dreamOptions}
          trigger={
            <Button className="shrink-0">
              + {t("pages.actions.newAction")}
            </Button>
          }
        />
      </div>

      <Separator />

      {actions.length === 0 ? (
        <Card className="flex-1">
          <Empty>
            <EmptyMedia variant="icon">
              <ListChecks />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t("pages.actions.empty.message")}</EmptyTitle>
              <EmptyDescription>
                {t("pages.actions.description")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <NewActionDialog
                dreams={dreamOptions}
                trigger={<Button>+ {t("pages.actions.newAction")}</Button>}
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
                <CardDescription>
                  {t("pages.actions.stats.totalActions")}
                </CardDescription>
                <CardTitle className="text-4xl tabular-nums">
                  {actions.length}
                </CardTitle>
                <CardAction>
                  <ListChecks className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">
                  {progressNumber}%{" "}
                  {t("pages.actions.stats.completedActions").toLowerCase()}
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
                  max={actions.length}
                  color="bg-amber-500"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>
                  {t("pages.actions.stats.completedActions")}
                </CardDescription>
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
                  max={actions.length}
                  color="bg-primary"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>
                  {t("pages.actions.stats.progressPercent")}
                </CardDescription>
                <CardTitle className="text-4xl tabular-nums text-primary">
                  {progressNumber}%
                </CardTitle>
                <CardAction>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={completedCount}
                  max={actions.length}
                  color="bg-primary"
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
              <CardDescription>
                {t("pages.actions.stats.progressPercent")}
              </CardDescription>
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
                {completedCount} de {actions.length}{" "}
                {t("pages.actions.stats.completedActions").toLowerCase()}
              </p>
            </CardContent>
          </Card>

          {/* Table */}
          <div
            className="duration-700 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: "350ms", animationFillMode: "both" }}
          >
            <ActionsTable actions={actions} />
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
