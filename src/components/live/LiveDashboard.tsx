'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import LiveIndicator from './LiveIndicator';
import LiveManagerRow from './LiveManagerRow';
import type {
  StandingsEntry,
  Player,
  PlayerStats,
  Pick,
  LiveEvent,
  FPLEvent,
} from '@/lib/types';

interface ManagerPicksData {
  entry: StandingsEntry;
  picks: Pick[] | null;
  activeChip: string | null;
}

interface LiveDashboardProps {
  currentEvent: FPLEvent;
  managers: ManagerPicksData[];
  initialLiveData: LiveEvent;
  playerMap: Record<number, Player>;
  teamMap: Record<number, string>;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LiveDashboard({
  currentEvent,
  managers,
  initialLiveData,
  playerMap: playerMapRaw,
  teamMap: teamMapRaw,
}: LiveDashboardProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // SWR for auto-refreshing live data
  const { data: liveData, isValidating, mutate } = useSWR<LiveEvent>(
    `/api/fpl/event/${currentEvent.id}/live`,
    fetcher,
    {
      fallbackData: initialLiveData,
      refreshInterval: 60000, // 60 seconds
      revalidateOnFocus: true,
      onSuccess: () => setLastUpdated(new Date()),
    }
  );

  // Convert raw objects back to Maps
  const playerMap = useMemo(() => new Map(Object.entries(playerMapRaw).map(([k, v]) => [Number(k), v])), [playerMapRaw]);
  const teamMap = useMemo(() => new Map(Object.entries(teamMapRaw).map(([k, v]) => [Number(k), v])), [teamMapRaw]);

  // Build live stats map
  const liveStats = useMemo(() => {
    const map = new Map<number, PlayerStats>();
    if (liveData?.elements) {
      liveData.elements.forEach(el => map.set(el.id, el.stats));
    }
    return map;
  }, [liveData]);

  // Calculate live points per manager and sort
  const sortedManagers = useMemo(() => {
    return managers.map((m) => {
      let liveGwPoints = 0;
      if (m.picks) {
        m.picks.forEach((pick) => {
          if (pick.position > 11 && m.activeChip !== 'bboost') return;
          const stats = liveStats.get(pick.element);
          if (stats) {
            liveGwPoints += stats.total_points * pick.multiplier;
          }
        });
      }
      return { ...m, liveGwPoints };
    }).sort((a, b) => b.liveGwPoints - a.liveGwPoints);
  }, [managers, liveStats]);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="space-y-4">
      {/* Live header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentEvent.name}
            {currentEvent.finished && (
              <span className="ml-2 text-sm font-normal text-fpl-muted">(Ferdig)</span>
            )}
          </h1>
          <p className="text-sm text-fpl-muted">
            Snitt: {currentEvent.average_entry_score} • Høyeste: {currentEvent.highest_score}
          </p>
        </div>
        <LiveIndicator
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isValidating}
        />
      </div>

      {/* Manager ranking */}
      <div className="rounded-xl border border-fpl-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-fpl-border bg-fpl-dark px-3 py-2 sm:gap-4">
          <span className="w-6 text-center text-xs font-medium text-fpl-muted">#</span>
          <span className="flex-1 text-xs font-medium text-fpl-muted">Manager</span>
          <span className="hidden sm:block text-center min-w-[100px] text-xs font-medium text-fpl-muted">Kaptein</span>
          <span className="hidden sm:block w-16 text-center text-xs font-medium text-fpl-muted">Chip</span>
          <span className="w-12 text-right text-xs font-medium text-fpl-muted">Poeng</span>
          <span className="w-4" /> {/* Chevron space */}
        </div>

        {/* Manager rows */}
        {sortedManagers.map((m, i) => (
          <LiveManagerRow
            key={m.entry.entry}
            rank={i + 1}
            entry={m.entry}
            picks={m.picks}
            activeChip={m.activeChip}
            liveGwPoints={m.liveGwPoints}
            playerMap={playerMap}
            liveStats={liveStats}
            teamMap={teamMap}
          />
        ))}
      </div>
    </div>
  );
}
