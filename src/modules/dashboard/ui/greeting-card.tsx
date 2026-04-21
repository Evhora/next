"use client";

import { useTranslations } from "next-intl";

interface GreetingCardProps {
  username: string;
  date: string;
  motivationalSentence: string;
}

export function GreetingCard({
  username,
  date,
  motivationalSentence,
}: GreetingCardProps) {
  const t = useTranslations();

  return (
    <div className="border-b border-zinc-200 pb-10 dark:border-zinc-800">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
        {date}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-light leading-[1.05] text-zinc-900 dark:text-zinc-50 md:text-6xl lg:text-7xl">
        {t("pages.dashboard.greeting.hello", { username })}
      </h1>
      <p className="mt-5 max-w-2xl text-sm italic leading-relaxed text-zinc-400 dark:text-zinc-600 md:text-base">
        {motivationalSentence}
      </p>
    </div>
  );
}
