export function DashboardSkeleton() {
  return (
    <div className="p-8 md:p-10 lg:p-12">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Greeting */}
        <div className="border-b border-zinc-200 pb-10 dark:border-zinc-800">
          <div className="h-3 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-16 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Stats bento */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-44 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-44 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-44 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 lg:h-auto lg:min-h-full" />
        </div>

        {/* Progress by area */}
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
