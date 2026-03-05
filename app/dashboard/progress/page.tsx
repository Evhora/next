import { getTranslations } from "next-intl/server";

export default async function ProgressPage() {
  const t = await getTranslations();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground">
          {t("pages.dashboard.sidebar.routes.progress")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("pages.dashboard.progress.description")}
        </p>
      </div>
    </div>
  );
}
