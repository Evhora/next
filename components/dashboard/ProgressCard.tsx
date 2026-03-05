interface ProgressCardProps {
  title: string;
  value: number;
  maxValue?: number;
  percentage?: number;
  subtitle?: string;
}

export function ProgressCard({
  title,
  value,
  maxValue,
  percentage,
  subtitle,
}: ProgressCardProps) {
  const displayPercentage =
    percentage !== undefined
      ? percentage
      : maxValue
        ? Math.round((value / maxValue) * 100)
        : 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </h3>
          <span className="text-2xl font-bold text-foreground">
            {displayPercentage}%
          </span>
        </div>
        {subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">{subtitle}</p>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${Math.min(displayPercentage, 100)}%` }}
          />
        </div>
        {maxValue !== undefined && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {value} of {maxValue}
          </p>
        )}
      </div>
    </div>
  );
}
