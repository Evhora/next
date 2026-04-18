import { ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { listDreamsForUser } from "@/modules/dreams/application/list-dreams-for-user";
import { buildCtx } from "@/shared/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import { listActionsForUser } from "../application/list-actions-for-user";
import { Action_ActionStatus } from "../domain/action";

import { ActionsTable } from "./actions-table";
import { NewActionDialog } from "./new-action-dialog";

/**
 * Server Component for /dashboard/actions. Loads the user's actions and the
 * dream list (so the new-action dialog can pick a parent dream) in one
 * authenticated round-trip.
 */
export async function ActionsPage() {
  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);
  const [actions, dreams] = await Promise.all([
    listActionsForUser(ctx),
    listDreamsForUser(ctx),
  ]);

  const completedCount = actions.filter(
    (a) => a.status === Action_ActionStatus.COMPLETED,
  ).length;
  const progressPercent =
    actions.length === 0
      ? "0%"
      : `${Math.round((completedCount / actions.length) * 100)}%`;

  const dreamOptions = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-foreground">
                {t("pages.actions.title")}
              </h1>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("pages.actions.description")}
            </p>
          </div>
          <NewActionDialog
            dreams={dreamOptions}
            trigger={<Button>+ {t("pages.actions.newAction")}</Button>}
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.totalActions")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {actions.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.completedActions")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {completedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.progressPercent")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {progressPercent}
              </p>
            </CardContent>
          </Card>
        </div>

        {actions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.empty.message")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ActionsTable actions={actions} />
        )}
      </div>
    </div>
  );
}
