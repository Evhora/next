import { ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { listDreamsForUser } from "@/modules/dreams/application/list-dreams-for-user";
import { buildCtx } from "@/shared/context";
import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

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
  const progressNumber =
    actions.length === 0
      ? 0
      : Math.round((completedCount / actions.length) * 100);

  const dreamOptions = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  const size = 148;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset =
    circumference - (Math.min(progressNumber, 100) / 100) * circumference;

  return (
    <div className="p-8 md:p-10 lg:p-12">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Hero header */}
        <div
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
          style={{ animationFillMode: "both" }}
        >
          <div className="flex items-start justify-between border-b border-zinc-100 pb-10 dark:border-zinc-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.description")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ListChecks className="h-9 w-9 text-zinc-900 dark:text-zinc-50" />
                <h1 className="text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl dark:text-zinc-50">
                  {t("pages.actions.title")}
                </h1>
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
        </div>

        {/* Stats */}
        <div
          className="animate-in fade-in-0 duration-700"
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: total / completed + progress bar */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.title")}
              </p>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-6xl font-bold tabular-nums leading-none text-zinc-900 dark:text-zinc-50">
                    {actions.length}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                    {t("pages.actions.stats.totalActions")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-6xl font-bold tabular-nums leading-none text-rose-500 dark:text-rose-400">
                    {completedCount}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                    {t("pages.actions.stats.completedActions")}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                    {t("pages.actions.stats.progressPercent")}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {progressNumber}%
                  </span>
                </div>
                <div className="relative h-px w-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="absolute inset-y-0 left-0 bg-rose-500 transition-all duration-700 dark:bg-rose-400"
                    style={{ width: `${Math.min(progressNumber, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: circular progress */}
            {actions.length > 0 ? (
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 lg:min-h-full">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
                  {t("pages.actions.stats.progressPercent")}
                </p>

                <div className="flex flex-1 flex-col items-center justify-center py-8">
                  <div className="relative">
                    <svg
                      width={size}
                      height={size}
                      className="-rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                      />
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="stroke-rose-500 transition-all duration-1000 dark:stroke-rose-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold tabular-nums leading-none text-zinc-900 dark:text-zinc-50">
                        {completedCount}
                      </span>
                      <span className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
                        / {actions.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-3xl font-bold tabular-nums text-rose-500 dark:text-rose-400">
                      {progressNumber}%
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                      {t("pages.actions.stats.completedActions")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-7 dark:border-zinc-800 dark:bg-zinc-900/50">
                <ListChecks className="h-12 w-12 text-zinc-200 dark:text-zinc-700" />
                <p className="mt-4 text-center text-sm text-zinc-400 dark:text-zinc-600">
                  {t("pages.actions.empty.message")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table or empty state */}
        <div
          className="animate-in fade-in-0 duration-700"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          {actions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
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
            </div>
          ) : (
            <ActionsTable actions={actions} />
          )}
        </div>
      </div>
    </div>
  );
}
