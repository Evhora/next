import { getTranslations } from "next-intl/server";

import { listDreamsForUser } from "@/modules/dreams/application/list-dreams-for-user";
import { buildCtx } from "@/shared/context";

import { DreamBoardClient } from "./dream-board-client";

/**
 * /dashboard/dream-board — Server Component shell. Loads the user's dreams
 * (so the picker has data on first paint) and hands them off to the client
 * island that drives image generation and the canvas export.
 */
export async function DreamBoardPage() {
  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);
  const dreams = await listDreamsForUser(ctx);

  const dreamOptions = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("pages.dreamBoard.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("pages.dreamBoard.description")}
          </p>
        </div>

        <DreamBoardClient dreams={dreamOptions} />
      </div>
    </div>
  );
}
