export function SummarySkeleton() {
  return (
    <div className="w-full mb-6 px-1 animate-pulse">
      {/* ONE BIG BOX CONTAINER - Mimic main layout */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col xl:flex-row items-stretch overflow-hidden">

        {/* SECTION 1: PROFILE (LEFT) - Skeleton */}
        <div className="flex-1 flex items-center gap-4 p-3">
          {/* Avatar placeholder */}
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />

          {/* Text placeholders */}
          <div className="flex flex-col justify-center gap-2 w-full">
            <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
          </div>
        </div>

        {/* SECTION 2: STATS WIDGETS (COMPACT) - Skeleton */}
        <div className="hidden xl:flex items-center justify-center p-2 flex-shrink-0">
          <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden divide-x divide-slate-100 dark:divide-zinc-800 shadow-sm">

            {/* Income placeholder */}
            <div className="flex flex-col justify-center px-4 py-1.5 min-w-[90px]">
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-12 mb-1" />
              <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-20" />
            </div>

            {/* Expense placeholder */}
            <div className="flex flex-col justify-center px-4 py-1.5 min-w-[90px]">
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-12 mb-1" />
              <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-20" />
            </div>

            {/* Balance placeholder */}
            <div className="flex flex-col justify-center px-5 py-1.5 min-w-[110px]">
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-12 mb-1" />
              <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-24" />
            </div>
          </div>
        </div>

        {/* SECTION 3: TIME (FAR RIGHT) - Skeleton */}
        <div className="flex flex-col justify-center items-end px-5 py-3 min-w-[140px] flex-shrink-0">
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-24 mb-2" />
          <div className="h-7 bg-slate-200 dark:bg-zinc-800 rounded w-28" />
        </div>

        {/* SECTION 4: ACTION BUTTONS (FAR RIGHT) - Skeleton */}
        <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0 border-l border-slate-100 dark:border-zinc-800">
          <div className="h-9 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-9 w-9 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-9 w-9 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
