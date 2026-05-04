import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Motivational quote */}
      <Skeleton className="h-4 w-2/3" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Domain cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>

      {/* Progress by area */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
