import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function HomeContent() {
  const t = await getTranslations();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          {t("pages.home.title")}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl">
          {t("pages.home.subtitle")}
        </p>
      </div>

      <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {t("pages.home.description")}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/auth/sign-up"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {t("pages.home.getStarted")}
        </Link>
        <Link
          href="/auth/login"
          className="flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-8 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("pages.home.signIn")}
        </Link>
      </div>
    </main>
  );
}

function HomeFallback() {
  return (
    <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-16 text-center">
      <div className="space-y-4">
        <div className="h-14 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-6 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-4">
        <div className="h-12 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-12 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Suspense fallback={<HomeFallback />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
