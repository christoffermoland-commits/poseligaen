export default function LiveLoading() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-40 animate-pulse rounded bg-fpl-surface" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-fpl-surface" />
          <div className="h-4 w-64 animate-pulse rounded bg-fpl-surface" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500/30" />
            <div className="h-4 w-10 animate-pulse rounded bg-fpl-surface" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-fpl-surface" />
        </div>
      </div>

      <div className="rounded-xl border border-fpl-border overflow-hidden">
        <div className="h-9 bg-fpl-dark" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-fpl-border/50 px-3 py-4">
            <div className="h-5 w-6 animate-pulse rounded bg-fpl-surface" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-fpl-surface" />
              <div className="h-3 w-24 animate-pulse rounded bg-fpl-surface" />
            </div>
            <div className="h-6 w-10 animate-pulse rounded bg-fpl-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
