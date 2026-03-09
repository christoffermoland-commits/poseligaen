export default function SpillLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-40 animate-pulse rounded bg-fpl-surface" />
      <div className="text-center space-y-2">
        <div className="h-8 w-48 mx-auto animate-pulse rounded bg-fpl-surface" />
        <div className="h-4 w-64 mx-auto animate-pulse rounded bg-fpl-surface" />
      </div>
      <div className="mx-auto max-w-3xl aspect-[4/3] rounded-xl border border-fpl-border bg-fpl-dark animate-pulse" />
    </div>
  );
}
