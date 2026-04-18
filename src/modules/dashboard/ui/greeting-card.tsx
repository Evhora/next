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
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{date}</p>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("pages.dashboard.greeting.hello", { username })} ✨
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {motivationalSentence}
          </p>
        </div>
      </div>
    </div>
  );
}
