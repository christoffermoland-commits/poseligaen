'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import LeagueTable from './LeagueTable';
import LiveIndicator from '@/components/live/LiveIndicator';
import type { StandingsEntry, Pick, LiveEvent, PlayerStats } from '@/lib/types';

interface ManagerPicksData {
  entryId: number;
  picks: Pick[] | null;
  activeChip: string | null;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LiveLeagueTable({
  entries,
  managerPicks,
  initialLiveData,
  eventId,
}: {
  entries: StandingsEntry[];
  managerPicks: ManagerPicksData[];
  initialLiveData: LiveEvent;
  eventId: number;
}) {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: liveData, isValidating, mutate } = useSWR<LiveEvent>(
    `/api/fpl/event/${eventId}/live`,
    fetcher,
    {
      fallbackData: initialLiveData,
      refreshInterval: 60000,
      revalidateOnFocus: true,
      onSuccess: () => setLastUpdated(new Date()),
    }
  );

  // Build live stats lookup
  const liveStats = useMemo(() => {
    const map = new Map<number, PlayerStats>();
    if (liveData?.elements) {
      liveData.elements.forEach(el => map.set(el.id, el.stats));
    }
    return map;
  }, [liveData]);

  // Build picks lookup by entryId
  const picksMap = useMemo(() => {
    const map = new Map<number, ManagerPicksData>();
    managerPicks.forEach(mp => map.set(mp.entryId, mp));
    return map;
  }, [managerPicks]);

  // Calculate live entries with updated points
  const liveEntries = useMemo(() => {
    return entries.map(entry => {
      const mp = picksMap.get(entry.entry);
      if (!mp?.picks) return entry;

      let liveGwPoints = 0;
      mp.picks.forEach(pick => {
        if (pick.position > 11 && mp.activeChip !== 'bboost') return;
        const stats = liveStats.get(pick.element);
        if (stats) {
          liveGwPoints += stats.total_points * pick.multiplier;
        }
      });

      const liveTotal = entry.total - entry.event_total + liveGwPoints;

      return {
        ...entry,
        event_total: liveGwPoints,
        total: liveTotal,
      };
    }).sort((a, b) => b.total - a.total).map((entry, i) => ({
      ...entry,
      rank: i + 1,
    }));
  }, [entries, picksMap, liveStats]);

  const handleRefresh = useCallback(() => { mutate(); }, [mutate]);

  return (
    <div className="space-y-3">
      <LiveIndicator
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isValidating}
      />
      <LeagueTable entries={liveEntries} isLive />
    </div>
  );
}
