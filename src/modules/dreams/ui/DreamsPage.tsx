import { Target } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buildCtx } from "@/shared/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import { getDreamProgress } from "../application/getDreamProgress";
import { listDreamsForUser } from "../application/listDreamsForUser";
import { DreamStatus } from "../domain/DreamStatus";

import { DreamsTable } from "./DreamsTable";
import { NewDreamDialog } from "./NewDreamDialog";

/**
 * Server Component entry point for /dashboard/dreams.
 *
 * Renders are entirely server-side: we authenticate, load the user's dreams
 * via the use case, and stream HTML with the data already populated. The
 * client bundle only ships the table interactions and the new-dream dialog.
 */
export async function DreamsPage() {
  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);
  const [dreams, progress] = await Promise.all([
    listDreamsForUser(ctx),
    getDreamProgress(ctx),
  ]);

  const completedCount = dreams.filter(
    (d) => d.props.status === DreamStatus.COMPLETED,
  ).length;
  const progressPercent =
    dreams.length === 0
      ? "0%"
      : `${Math.round((completedCount / dreams.length) * 100)}%`;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-foreground">
                {t("pages.dreams.title")}
              </h1>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("pages.dreams.description")}
            </p>
          </div>
          <NewDreamDialog
            trigger={<Button>+ {t("pages.dreams.newDream")}</Button>}
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.totalDreams")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {dreams.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.completedDreams")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {completedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.progressPercent")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {progressPercent}
              </p>
            </CardContent>
          </Card>
        </div>

        {dreams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.empty.message")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DreamsTable
            dreams={dreams.map((d) => d.props)}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
}
