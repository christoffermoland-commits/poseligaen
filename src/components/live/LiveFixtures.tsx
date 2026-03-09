'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import type { Fixture, Player } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getMatchStatus(fixture: Fixture): 'live' | 'finished' | 'upcoming' {
  if (fixture.started && !fixture.finished) return 'live';
  if (fixture.finished) return 'finished';
  return 'upcoming';
}

function formatKickoff(kickoff: string | null): string {
  if (!kickoff) return 'TBD';
  return new Date(kickoff).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function MatchCard({
  fixture,
  teamNames,
  playerMap,
}: {
  fixture: Fixture;
  teamNames: Record<number, string>;
  playerMap: Record<number, Player>;
}) {
  const status = getMatchStatus(fixture);

  // Extract key stats
  const goals = fixture.stats.find(s => s.identifier === 'goals_scored');
  const assists = fixture.stats.find(s => s.identifier === 'assists');
  const yellows = fixture.stats.find(s => s.identifier === 'yellow_cards');
  const reds = fixture.stats.find(s => s.identifier === 'red_cards');
  const bonus = fixture.stats.find(s => s.identifier === 'bonus');

  const homeGoalscorers = goals?.h || [];
  const awayGoalscorers = goals?.a || [];
  const homeAssists = assists?.h || [];
  const awayAssists = assists?.a || [];

  const getPlayerName = (elementId: number) => playerMap[elementId]?.web_name || `#${elementId}`;

  // Build goal event strings
  const buildGoalEvents = (scorers: { element: number; value: number }[], assistList: { element: number; value: number }[]) => {
    return scorers.map(g => {
      const assist = assistList.find(a => a.element !== g.element);
      const goalText = g.value > 1 ? `${getPlayerName(g.element)} x${g.value}` : getPlayerName(g.element);
      return goalText;
    });
  };

  const homeGoalEvents = buildGoalEvents(homeGoalscorers, homeAssists);
  const awayGoalEvents = buildGoalEvents(awayGoalscorers, awayAssists);

  return (
    <div className={`rounded-lg border p-3 ${
      status === 'live' ? 'border-red-500/50 bg-red-500/5' :
      status === 'finished' ? 'border-fpl-border bg-fpl-surface' :
      'border-fpl-border/50 bg-fpl-dark'
    }`}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-2">
        {status === 'live' ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-400">{fixture.minutes}&apos;</span>
          </div>
        ) : status === 'finished' ? (
          <span className="text-xs text-fpl-muted">FT</span>
        ) : (
          <span className="text-xs text-fpl-muted">{formatKickoff(fixture.kickoff_time)}</span>
        )}
        {/* Bonus points */}
        {status === 'finished' && bonus && bonus.h.length + bonus.a.length > 0 && (
          <div className="flex gap-1">
            {[...bonus.h, ...bonus.a].sort((a, b) => b.value - a.value).slice(0, 3).map((b, i) => (
              <span key={i} className="text-[10px] text-fpl-gold">
                {getPlayerName(b.element)}({b.value})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Score line */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right">
          <span className="text-sm font-medium">{teamNames[fixture.team_h] || '?'}</span>
        </div>
        <div className="rounded bg-fpl-dark px-3 py-1 text-center min-w-[50px]">
          {status === 'upcoming' ? (
            <span className="text-sm text-fpl-muted">vs</span>
          ) : (
            <span className="text-sm font-bold">
              {fixture.team_h_score ?? 0} - {fixture.team_a_score ?? 0}
            </span>
          )}
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium">{teamNames[fixture.team_a] || '?'}</span>
        </div>
      </div>

      {/* Goal events */}
      {(homeGoalEvents.length > 0 || awayGoalEvents.length > 0) && (
        <div className="mt-2 flex justify-between gap-2 text-[11px]">
          <div className="flex-1 text-right space-y-0.5">
            {homeGoalEvents.map((g, i) => (
              <div key={i} className="text-fpl-green">&#9917; {g}</div>
            ))}
          </div>
          <div className="w-[50px]" />
          <div className="flex-1 space-y-0.5">
            {awayGoalEvents.map((g, i) => (
              <div key={i} className="text-fpl-green">&#9917; {g}</div>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {((yellows && (yellows.h.length > 0 || yellows.a.length > 0)) ||
        (reds && (reds.h.length > 0 || reds.a.length > 0))) && (
        <div className="mt-1 flex justify-between gap-2 text-[11px]">
          <div className="flex-1 text-right space-y-0.5">
            {yellows?.h.map((c, i) => (
              <div key={`yh${i}`} className="text-yellow-400">&#9632; {getPlayerName(c.element)}</div>
            ))}
            {reds?.h.map((c, i) => (
              <div key={`rh${i}`} className="text-red-400">&#9632; {getPlayerName(c.element)}</div>
            ))}
          </div>
          <div className="w-[50px]" />
          <div className="flex-1 space-y-0.5">
            {yellows?.a.map((c, i) => (
              <div key={`ya${i}`} className="text-yellow-400">&#9632; {getPlayerName(c.element)}</div>
            ))}
            {reds?.a.map((c, i) => (
              <div key={`ra${i}`} className="text-red-400">&#9632; {getPlayerName(c.element)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveFixtures({
  eventId,
  initialFixtures,
  teamNames,
  playerMap,
}: {
  eventId: number;
  initialFixtures: Fixture[];
  teamNames: Record<number, string>;
  playerMap: Record<number, Player>;
}) {
  const { data: fixtures } = useSWR<Fixture[]>(
    `/api/fpl/fixtures?event=${eventId}`,
    fetcher,
    {
      fallbackData: initialFixtures,
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  // Sort: live first, then upcoming, then finished
  const sortedFixtures = useMemo(() => {
    if (!fixtures) return [];
    return [...fixtures].sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 };
      const sa = statusOrder[getMatchStatus(a)];
      const sb = statusOrder[getMatchStatus(b)];
      if (sa !== sb) return sa - sb;
      // Within same status, sort by kickoff time
      const ka = a.kickoff_time || '';
      const kb = b.kickoff_time || '';
      return ka.localeCompare(kb);
    });
  }, [fixtures]);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-fpl-muted uppercase tracking-wider">Kamper</h3>
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin">
        {sortedFixtures.map(f => (
          <MatchCard
            key={f.id}
            fixture={f}
            teamNames={teamNames}
            playerMap={playerMap}
          />
        ))}
      </div>
    </div>
  );
}
