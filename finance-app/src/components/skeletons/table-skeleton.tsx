interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4 px-1 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-t-xl shadow-sm h-12" />

      {/* Table Rows Skeleton */}
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 h-12"
        />
      ))}

      {/* Table Footer Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-b-xl shadow-sm h-12" />
    </div>
  );
}
