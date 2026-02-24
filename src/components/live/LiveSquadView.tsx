'use client';

import { cn } from '@/lib/utils';
import type { Pick, Player, PlayerStats } from '@/lib/types';

interface LiveSquadViewProps {
  picks: Pick[];
  playerMap: Map<number, Player>;
  liveStats: Map<number, PlayerStats>;
  activeChip: string | null;
  teamMap: Map<number, string>;
}

const STAT_LABELS: Record<string, { label: string; perUnit: number }> = {
  minutes: { label: 'Minutter', perUnit: 1 },
  goals_scored: { label: 'Mål', perUnit: 1 },
  assists: { label: 'Assists', perUnit: 1 },
  clean_sheets: { label: 'Clean sheet', perUnit: 1 },
  goals_conceded: { label: 'Baklengs', perUnit: 1 },
  own_goals: { label: 'Selvmål', perUnit: 1 },
  penalties_saved: { label: 'Strafferedning', perUnit: 1 },
  penalties_missed: { label: 'Straffe bom', perUnit: 1 },
  yellow_cards: { label: 'Gult kort', perUnit: 1 },
  red_cards: { label: 'Rødt kort', perUnit: 1 },
  saves: { label: 'Redninger', perUnit: 1 },
  bonus: { label: 'Bonus', perUnit: 1 },
};

function getMinuteStatus(minutes: number): 'playing' | 'not_started' | 'subbed_off' | 'full' {
  if (minutes === 0) return 'not_started';
  if (minutes >= 90) return 'full';
  if (minutes > 0 && minutes < 90) return 'playing';
  return 'not_started';
}

function MinuteIndicator({ minutes }: { minutes: number }) {
  const status = getMinuteStatus(minutes);

  return (
    <span className="flex items-center gap-1">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'playing' && 'bg-fpl-green animate-pulse',
          status === 'full' && 'bg-fpl-green',
          status === 'not_started' && 'bg-fpl-muted/40',
          status === 'subbed_off' && 'bg-fpl-pink',
        )}
      />
      <span className="text-[9px] text-fpl-muted">
        {minutes > 0 ? `${minutes}'` : ''}
      </span>
    </span>
  );
}

function StatsBreakdown({ stats }: { stats: PlayerStats }) {
  const entries = Object.entries(stats).filter(([key, val]) => {
    if (key === 'total_points' || key === 'bps' || key === 'minutes') return false;
    return typeof val === 'number' && val > 0;
  });

  if (entries.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {entries.map(([key, val]) => {
        const info = STAT_LABELS[key];
        if (!info) return null;
        return (
          <span
            key={key}
            className={cn(
              'rounded px-1 py-0.5 text-[8px] font-medium',
              key === 'goals_scored' && 'bg-fpl-green/20 text-fpl-green',
              key === 'assists' && 'bg-fpl-cyan/20 text-fpl-cyan',
              key === 'clean_sheets' && 'bg-blue-500/20 text-blue-400',
              key === 'bonus' && 'bg-fpl-gold/20 text-fpl-gold',
              key === 'yellow_cards' && 'bg-yellow-500/20 text-yellow-400',
              key === 'red_cards' && 'bg-red-500/20 text-red-400',
              key === 'own_goals' && 'bg-fpl-pink/20 text-fpl-pink',
              key === 'saves' && 'bg-purple-500/20 text-purple-400',
              !['goals_scored', 'assists', 'clean_sheets', 'bonus', 'yellow_cards', 'red_cards', 'own_goals', 'saves'].includes(key) && 'bg-fpl-surface-light text-fpl-muted',
            )}
          >
            {info.label}: {val}
          </span>
        );
      })}
    </div>
  );
}

export default function LiveSquadView({
  picks,
  playerMap,
  liveStats,
  activeChip,
  teamMap,
}: LiveSquadViewProps) {
  const starters = picks.filter(p => p.position <= 11);
  const bench = picks.filter(p => p.position > 11);

  const grouped: Record<number, (Pick & { player?: Player; stats?: PlayerStats; points: number })[]> = {};
  starters.forEach((pick) => {
    const player = playerMap.get(pick.element);
    const stats = liveStats.get(pick.element);
    const posType = player?.element_type || 0;
    if (!grouped[posType]) grouped[posType] = [];
    const pts = (stats?.total_points || 0) * pick.multiplier;
    grouped[posType].push({ ...pick, player, stats, points: pts });
  });

  return (
    <div className="rounded-xl border border-fpl-border bg-fpl-surface p-3">
      {activeChip && (
        <div className="mb-2">
          <span className="rounded-full bg-fpl-gold/20 px-2 py-0.5 text-xs font-medium text-fpl-gold">
            {activeChip}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        {[1, 2, 3, 4].map((pos) => (
          <div key={pos} className="flex flex-wrap justify-center gap-1.5">
            {(grouped[pos] || []).map((pick) => (
              <LivePlayerTile
                key={pick.element}
                pick={pick}
                player={pick.player}
                stats={pick.stats}
                points={pick.points}
                teamShort={teamMap.get(pick.player?.team || 0) || ''}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bench */}
      <div className="mt-2 border-t border-fpl-border pt-2">
        <div className="mb-1 text-center text-[10px] text-fpl-muted">Benk</div>
        <div className="flex justify-center gap-1.5">
          {bench.map((pick) => {
            const player = playerMap.get(pick.element);
            const stats = liveStats.get(pick.element);
            const pts = stats?.total_points || 0;
            return (
              <LivePlayerTile
                key={pick.element}
                pick={pick}
                player={player}
                stats={stats}
                points={pts}
                teamShort={teamMap.get(player?.team || 0) || ''}
                isBench
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LivePlayerTile({
  pick,
  player,
  stats,
  points,
  teamShort,
  isBench = false,
}: {
  pick: Pick;
  player?: Player;
  stats?: PlayerStats;
  points: number;
  teamShort: string;
  isBench?: boolean;
}) {
  const minutes = stats?.minutes || 0;

  return (
    <div
      className={cn(
        'relative flex w-[80px] flex-col items-center rounded-lg p-1.5 text-center transition-all',
        isBench ? 'bg-fpl-dark/50' : 'bg-fpl-dark',
      )}
    >
      {/* Captain/VC badge */}
      {pick.is_captain && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fpl-gold text-[9px] font-bold text-black">
          C
        </span>
      )}
      {pick.is_vice_captain && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fpl-silver text-[9px] font-bold text-black">
          V
        </span>
      )}

      {/* Minutes indicator */}
      <div className="absolute top-0.5 left-1">
        <MinuteIndicator minutes={minutes} />
      </div>

      <div className="mt-2 truncate text-[11px] font-medium leading-tight">
        {player?.web_name || '???'}
      </div>
      <div className="text-[9px] text-fpl-muted">{teamShort}</div>

      {/* Points */}
      <div
        className={cn(
          'mt-0.5 rounded px-1.5 py-0.5 text-xs font-bold transition-colors',
          points >= 10 ? 'bg-fpl-green/30 text-fpl-green' :
          points >= 6 ? 'bg-fpl-green/15 text-fpl-green' :
          points >= 3 ? 'bg-fpl-surface-light text-foreground' :
          minutes > 0 ? 'bg-fpl-pink/10 text-fpl-pink' :
          'bg-fpl-surface-light text-fpl-muted',
        )}
      >
        {points}
      </div>

      {/* BPS for active players */}
      {stats && stats.bps > 0 && !isBench && (
        <div className="text-[8px] text-fpl-muted">
          BPS: {stats.bps}
        </div>
      )}

      {/* Stats breakdown */}
      {stats && minutes > 0 && !isBench && (
        <StatsBreakdown stats={stats} />
      )}
    </div>
  );
}
