export function DashboardSkeleton() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-32 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        {[0, 1].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((card) => (
                <div
                  key={card}
                  className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
