import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { ProgressByAreaCard } from "@/components/dashboard/ProgressByAreaCard";
import { Card, CardContent } from "@/components/ui/card";
import { Action } from "@/lib/domain/entities/action";
import { Dream } from "@/lib/domain/entities/dream";
import { Sentence } from "@/lib/domain/entities/sentence";
import { ActionStatus } from "@/lib/domain/enums/action";
import { DreamAreaOfLife, DreamStatus } from "@/lib/domain/enums/dream";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type DreamRow = { data: Dream & { areaOfLife?: string } };
type ActionRow = { data: Action & { dueDate?: string | null } };

/** Normalize dream status from data (may be int or label string) to enum value. */
function dreamStatus(
  d: Dream | (Dream & { status?: number | string }),
): number {
  const s = (d as { status?: number | string }).status;
  if (s === undefined) return DreamStatus.UNSPECIFIED;
  return typeof s === "number"
    ? s
    : (DreamStatus[s as keyof typeof DreamStatus] ?? DreamStatus.UNSPECIFIED);
}

function dreamArea(
  d: Dream & { areaOfLife?: string },
): string | number | undefined {
  return (d as { area_of_life?: number }).area_of_life ?? d.areaOfLife;
}

function actionDueDate(a: Action & { dueDate?: string | null }): string | null {
  return a.dueDate ?? (a as { due_date?: string | null }).due_date ?? null;
}

async function getDashboardData(userId: string) {
  const t = await getTranslations();
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const username =
      (user?.user_metadata?.display_name as string) ||
      (user?.user_metadata?.full_name as string) ||
      user?.email?.split("@")[0] ||
      "User";

    const { data: sentencesRows } = await supabase
      .from("sentences")
      .select("data")
      .is("deleted_at", null)
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(20);

    const sentences: Sentence[] = (sentencesRows ?? []).map(
      (row: { data: Sentence }) => row.data,
    );
    let randomSentence = t("pages.dashboard.greeting.defaultMotivational");

    if (sentences.length > 0) {
      const unusedSentences = sentences.filter((s) => !s.last_used_at);
      const selectedSentence =
        unusedSentences.length > 0
          ? unusedSentences[Math.floor(Math.random() * unusedSentences.length)]
          : sentences[Math.floor(Math.random() * sentences.length)];

      if (selectedSentence?.text) {
        randomSentence = selectedSentence.text;
      }
    }

    const { data: dreamsRows } = await supabase
      .from("dreams")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null);

    const dreams: (Dream & { areaOfLife?: string })[] = (dreamsRows ?? []).map(
      (row: DreamRow) => row.data,
    );

    const totalDreams = dreams.length;
    const completedDreams = dreams.filter(
      (d) => dreamStatus(d) === DreamStatus.COMPLETED,
    ).length;
    const dreamsProgressPercent =
      totalDreams === 0 ? 0 : Math.round((completedDreams / totalDreams) * 100);

    const todayDate = new Date().toISOString().split("T")[0];
    const { data: actionsRows } = await supabase
      .from("actions")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null);

    const actions: (Action & { dueDate?: string | null })[] = (
      actionsRows ?? []
    ).map((row: ActionRow) => row.data);

    const actionStatusValue = (a: { status?: number | string }) =>
      typeof a.status === "number"
        ? a.status
        : (ActionStatus[
            (a.status ?? "UNSPECIFIED") as keyof typeof ActionStatus
          ] ?? ActionStatus.UNSPECIFIED);

    const totalActions = actions.length;
    const completedActions = actions.filter(
      (a) => actionStatusValue(a) === ActionStatus.COMPLETED,
    ).length;
    const actionsProgressPercent =
      totalActions === 0
        ? 0
        : Math.round((completedActions / totalActions) * 100);

    const todayActions = actions.filter((a) => actionDueDate(a) === todayDate);
    const todayActionsCompleted = todayActions.filter(
      (a) => actionStatusValue(a) === ActionStatus.COMPLETED,
    ).length;
    const todayActionsTotal = todayActions.length;
    const todayActionsProgress =
      todayActionsTotal > 0
        ? Math.round((todayActionsCompleted / todayActionsTotal) * 100)
        : 0;

    const AREA_KEYS = [
      "FAMILY_AND_RELANTIONSHIP",
      "HEALTH_AND_WELL_BEING",
      "BUSINESS_AND_FINANCE",
      "SPIRITUALITY",
      "LIFESTYLE",
    ] as const;

    const progressByArea = AREA_KEYS.map((areaKey) => {
      const areaNum = DreamAreaOfLife[areaKey];
      const areaDreams = dreams.filter((d) => {
        const a = dreamArea(d);
        return a === areaNum || a === areaKey;
      });
      const total = areaDreams.length;
      const completed = areaDreams.filter(
        (d) => dreamStatus(d) === DreamStatus.COMPLETED,
      ).length;
      const percentage =
        total === 0 ? 0 : Math.round((completed / total) * 100);
      return { area: areaKey, percentage };
    });

    return {
      username,
      motivationalSentence: randomSentence,
      dreams: {
        total: totalDreams,
        completed: completedDreams,
        progressPercent: dreamsProgressPercent,
      },
      actions: {
        total: totalActions,
        completed: completedActions,
        progressPercent: actionsProgressPercent,
      },
      todayActions: {
        completed: todayActionsCompleted,
        total: todayActionsTotal,
        progress: todayActionsProgress,
      },
      progressByArea,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      username: "User",
      motivationalSentence:
        "Every day is a new opportunity to make progress towards your dreams!",
      dreams: { total: 0, completed: 0, progressPercent: 0 },
      actions: { total: 0, completed: 0, progressPercent: 0 },
      todayActions: { completed: 0, total: 0, progress: 0 },
      progressByArea: [
        { area: "FAMILY_AND_RELANTIONSHIP", percentage: 0 },
        { area: "HEALTH_AND_WELL_BEING", percentage: 0 },
        { area: "BUSINESS_AND_FINANCE", percentage: 0 },
        { area: "SPIRITUALITY", percentage: 0 },
        { area: "LIFESTYLE", percentage: 0 },
      ],
    };
  }
}

async function DashboardContent() {
  const t = await getTranslations();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dashboardData = await getDashboardData(user.id);

  // Format today's date in Portuguese
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedDate = dateFormatter.format(today);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <GreetingCard
          username={dashboardData.username}
          date={formattedDate}
          motivationalSentence={dashboardData.motivationalSentence}
        />

        {/* Dreams stats (same data as dreams page) */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("pages.dreams.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.dreams.stats.totalDreams")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.dreams.total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.dreams.stats.completedDreams")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.dreams.completed}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.dreams.stats.progressPercent")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.dreams.progressPercent}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions stats (same data as actions page) */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("pages.actions.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.actions.stats.totalActions")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.actions.total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.actions.stats.completedActions")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.actions.completed}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {t("pages.actions.stats.progressPercent")}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {dashboardData.actions.progressPercent}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("pages.dashboard.progress.todayActions")}
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dashboard.progress.completed", {
                  completed: dashboardData.todayActions.completed,
                  total: dashboardData.todayActions.total,
                })}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {dashboardData.todayActions.completed} /{" "}
                {dashboardData.todayActions.total}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      dashboardData.todayActions.progress,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <ProgressByAreaCard areas={dashboardData.progressByArea} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-32 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
