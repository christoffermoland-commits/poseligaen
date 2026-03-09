import Link from 'next/link';
import { cn, getRankMovement } from '@/lib/utils';
import type { StandingsEntry } from '@/lib/types';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-block h-3 w-3 rounded-full bg-fpl-gold" />;
  if (rank === 2) return <span className="inline-block h-3 w-3 rounded-full bg-fpl-silver" />;
  if (rank === 3) return <span className="inline-block h-3 w-3 rounded-full bg-fpl-bronze" />;
  return null;
}

function MovementArrow({ current, last }: { current: number; last: number }) {
  const movement = getRankMovement(current, last);
  const diff = Math.abs(current - last);

  if (movement === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-xs text-fpl-green">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2L10 8H2L6 2Z" />
        </svg>
        {diff}
      </span>
    );
  }
  if (movement === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-xs text-fpl-pink">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 10L2 4H10L6 10Z" />
        </svg>
        {diff}
      </span>
    );
  }
  return <span className="text-xs text-fpl-muted">-</span>;
}

export default function LeagueTable({ entries, isLive }: { entries: StandingsEntry[]; isLive?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-fpl-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-fpl-border bg-fpl-dark">
            <th className="px-3 py-3 text-left font-medium text-fpl-muted w-12">#</th>
            <th className="px-3 py-3 text-center font-medium text-fpl-muted w-12"></th>
            <th className="px-3 py-3 text-left font-medium text-fpl-muted">Lag</th>
            <th className="px-3 py-3 text-right font-medium text-fpl-muted">
              <span className="flex items-center justify-end gap-1.5">
                GW
                {isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </span>
            </th>
            <th className="px-3 py-3 text-right font-medium text-fpl-muted">Totalt</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.entry}
              className={cn(
                'border-b border-fpl-border/50 transition-colors hover:bg-fpl-surface-light',
                i < 3 && 'bg-fpl-surface/50'
              )}
            >
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-bold',
                    entry.rank === 1 && 'text-fpl-gold',
                    entry.rank === 2 && 'text-fpl-silver',
                    entry.rank === 3 && 'text-fpl-bronze',
                  )}>
                    {entry.rank}
                  </span>
                  <RankBadge rank={entry.rank} />
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <MovementArrow current={entry.rank} last={entry.last_rank} />
              </td>
              <td className="px-3 py-3">
                <Link
                  href={`/manager/${entry.entry}`}
                  className="font-medium text-foreground hover:text-fpl-green transition-colors"
                >
                  {entry.entry_name}
                </Link>
                <div className="text-xs text-fpl-muted">{entry.player_name}</div>
              </td>
              <td className="px-3 py-3 text-right">
                <span className={cn(
                  'font-semibold',
                  entry.event_total >= 60 && 'text-fpl-green',
                  entry.event_total >= 40 && entry.event_total < 60 && 'text-foreground',
                  entry.event_total < 40 && 'text-fpl-pink',
                )}>
                  {entry.event_total}
                </span>
              </td>
              <td className="px-3 py-3 text-right font-bold">{entry.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
