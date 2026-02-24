'use client';

import { useEffect, useState } from 'react';

export default function LiveIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing,
}: {
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatAgo = (secs: number) => {
    if (secs < 10) return 'akkurat nå';
    if (secs < 60) return `${secs}s siden`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s siden`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <span className="text-sm font-bold text-red-400">LIVE</span>
      </div>

      <span className="text-xs text-fpl-muted">
        Oppdatert {formatAgo(secondsAgo)}
      </span>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="rounded-lg border border-fpl-border px-2.5 py-1 text-xs text-fpl-muted transition-colors hover:border-fpl-green hover:text-fpl-green disabled:opacity-50"
      >
        {isRefreshing ? (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Oppdaterer...
          </span>
        ) : (
          '↻ Oppdater'
        )}
      </button>
    </div>
  );
}

export function LiveBadge() {
  return (
    <span className="relative flex items-center gap-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
    </span>
  );
}
