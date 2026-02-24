'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Pick, Player, PlayerStats, StandingsEntry } from '@/lib/types';
import LiveSquadView from './LiveSquadView';
import Link from 'next/link';

interface LiveManagerRowProps {
  rank: number;
  entry: StandingsEntry;
  picks: Pick[] | null;
  activeChip: string | null;
  liveGwPoints: number;
  playerMap: Map<number, Player>;
  liveStats: Map<number, PlayerStats>;
  teamMap: Map<number, string>;
}

export default function LiveManagerRow({
  rank,
  entry,
  picks,
  activeChip,
  liveGwPoints,
  playerMap,
  liveStats,
  teamMap,
}: LiveManagerRowProps) {
  const [expanded, setExpanded] = useState(false);

  const captain = picks?.find(p => p.is_captain);
  const captainPlayer = captain ? playerMap.get(captain.element) : undefined;
  const captainStats = captain ? liveStats.get(captain.element) : undefined;
  const captainPts = captainStats ? captainStats.total_points * (captain?.multiplier || 1) : 0;

  return (
    <div className={cn(
      'border-b border-fpl-border/50 transition-colors',
      expanded && 'bg-fpl-surface/30',
    )}>
      {/* Collapsed row */}
      <button
        onClick={() => picks && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-fpl-surface-light sm:gap-4"
      >
        {/* Rank */}
        <span className={cn(
          'w-6 text-center text-sm font-bold',
          rank === 1 && 'text-fpl-gold',
          rank === 2 && 'text-fpl-silver',
          rank === 3 && 'text-fpl-bronze',
        )}>
          {rank}
        </span>

        {/* Manager name */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/manager/${entry.entry}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-sm font-medium hover:text-fpl-green transition-colors"
          >
            {entry.player_name}
          </Link>
          <div className="truncate text-xs text-fpl-muted">{entry.entry_name}</div>
        </div>

        {/* Captain */}
        <div className="hidden sm:block text-center min-w-[100px]">
          {captainPlayer && (
            <div>
              <span className="text-xs text-fpl-muted">{captainPlayer.web_name}</span>
              <span className="ml-1 text-xs font-bold text-fpl-gold">({captainPts})</span>
            </div>
          )}
        </div>

        {/* Chip */}
        <div className="hidden sm:block w-16 text-center">
          {activeChip && (
            <span className="rounded-full bg-fpl-cyan/20 px-1.5 py-0.5 text-[10px] text-fpl-cyan">
              {activeChip}
            </span>
          )}
        </div>

        {/* Live GW points */}
        <div className="w-12 text-right">
          <span className={cn(
            'text-lg font-bold',
            liveGwPoints >= 60 ? 'text-fpl-green' :
            liveGwPoints >= 40 ? 'text-foreground' :
            'text-fpl-pink',
          )}>
            {liveGwPoints}
          </span>
        </div>

        {/* Expand chevron */}
        <svg
          className={cn(
            'h-4 w-4 text-fpl-muted transition-transform',
            expanded && 'rotate-180',
            !picks && 'opacity-0',
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Expanded squad view */}
      {expanded && picks && (
        <div className="px-3 pb-4">
          <LiveSquadView
            picks={picks}
            playerMap={playerMap}
            liveStats={liveStats}
            activeChip={activeChip}
            teamMap={teamMap}
          />
        </div>
      )}
    </div>
  );
}
