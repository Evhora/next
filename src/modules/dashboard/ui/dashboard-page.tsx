import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { tryBuildCtx } from "@/shared/context";

import { getDashboardSummary } from "../application/get-dashboard-summary";

import { DashboardSkeleton } from "./dashboard-skeleton";
import { GreetingCard } from "./greeting-card";
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

  const size = 148;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset =
    circumference -
    (Math.min(summary.todayActions.progress, 100) / 100) * circumference;

  return (
    <div className="p-8 md:p-10 lg:p-12">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Greeting */}
        <div
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
          style={{ animationFillMode: "both" }}
        >
          <GreetingCard
            username={ctx.user.displayName}
            date={formattedDate}
            motivationalSentence={motivationalSentence}
          />
        </div>

        {/* Bento stats */}
        <div
          className="animate-in fade-in-0 duration-700"
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DomainStatCard
                title={t("pages.dreams.title")}
                total={summary.dreams.total}
                completed={summary.dreams.completed}
                progress={summary.dreams.progressPercent}
                totalLabel={t("pages.dreams.stats.totalDreams")}
                completedLabel={t("pages.dreams.stats.completedDreams")}
                href="/dashboard/dreams"
                viewAllLabel={t("pages.dreams.title")}
              />
              <DomainStatCard
                title={t("pages.actions.title")}
                total={summary.actions.total}
                completed={summary.actions.completed}
                progress={summary.actions.progressPercent}
                totalLabel={t("pages.actions.stats.totalActions")}
                completedLabel={t("pages.actions.stats.completedActions")}
                href="/dashboard/actions"
                viewAllLabel={t("pages.actions.title")}
              />
            </div>

            <TodayFocusCard
              completed={summary.todayActions.completed}
              total={summary.todayActions.total}
              progress={summary.todayActions.progress}
              title={t("pages.dashboard.progress.todayActions")}
              completedText={t("pages.dashboard.progress.completed", {
                completed: summary.todayActions.completed,
                total: summary.todayActions.total,
              })}
              size={size}
              radius={radius}
              circumference={circumference}
              offset={offset}
            />
          </div>
        </div>

        {/* Progress by area */}
        <div
          className="animate-in fade-in-0 duration-700"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <ProgressByAreaCard areas={summary.progressByArea} />
        </div>

      </div>
    </div>
  );
}

interface DomainStatCardProps {
  title: string;
  total: number;
  completed: number;
  progress: number;
  totalLabel: string;
  completedLabel: string;
  href: string;
  viewAllLabel: string;
}

function DomainStatCard({
  title,
  total,
  completed,
  progress,
  totalLabel,
  completedLabel,
  href,
  viewAllLabel,
}: DomainStatCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-7 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
          {title}
        </p>
        <Link
          href={href}
          aria-label={viewAllLabel}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:text-zinc-900 dark:text-zinc-700 dark:hover:text-zinc-50"
        >
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-6xl font-bold tabular-nums leading-none text-zinc-900 dark:text-zinc-50">
            {total}
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
            {totalLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-6xl font-bold tabular-nums leading-none text-rose-500 dark:text-rose-400">
            {completed}
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
            {completedLabel}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-2">
        <div className="flex justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
            Progresso
          </span>
          <span className="text-[10px] font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {progress}%
          </span>
        </div>
        <div className="relative h-px w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 bg-rose-500 transition-all duration-700 dark:bg-rose-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface TodayFocusCardProps {
  completed: number;
  total: number;
  progress: number;
  title: string;
  completedText: string;
  size: number;
  radius: number;
  circumference: number;
  offset: number;
}

function TodayFocusCard({
  completed,
  total,
  progress,
  title,
  completedText,
  size,
  radius,
  circumference,
  offset,
}: TodayFocusCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 lg:min-h-full">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
        {title}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
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
              strokeWidth={7}
              className="stroke-zinc-100 dark:stroke-zinc-800"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={7}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="stroke-rose-500 transition-all duration-1000 dark:stroke-rose-400"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums leading-none text-zinc-900 dark:text-zinc-50">
              {completed}
            </span>
            <span className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
              / {total}
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-3xl font-bold tabular-nums text-rose-500 dark:text-rose-400">
            {progress}%
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            {completedText}
          </p>
        </div>
      </div>
    </div>
  );
}
