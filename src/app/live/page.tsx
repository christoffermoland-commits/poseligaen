import {
  getBootstrapData,
  getLeagueStandings,
  getLiveEvent,
  getGameweekPicks,
} from '@/lib/fpl-api';
import { FPL_LEAGUE_ID } from '@/lib/config';
import LiveDashboard from '@/components/live/LiveDashboard';
import Link from 'next/link';
import type { Player, FPLTeam } from '@/lib/types';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LivePage() {
  const [bootstrap, standings] = await Promise.all([
    getBootstrapData(),
    getLeagueStandings(FPL_LEAGUE_ID),
  ]);

  // Find current or most recent event
  const currentEvent = bootstrap.events.find(e => e.is_current);
  const lastFinished = bootstrap.events.filter(e => e.finished).pop();
  const activeEvent = currentEvent || lastFinished;

  // If no event at all, show message
  if (!activeEvent) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">⏳</div>
        <h1 className="text-xl font-bold">Sesongen har ikke startet</h1>
        <p className="text-sm text-fpl-muted">Venter på at første gameweek skal begynne.</p>
      </div>
    );
  }

  // If no GW is currently live, show link to latest finished
  if (!currentEvent && lastFinished) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">😴</div>
        <h1 className="text-xl font-bold">Ingen runde pågår akkurat nå</h1>
        <p className="text-sm text-fpl-muted">
          Siste gameweek var {lastFinished.name}.
        </p>
        <Link
          href={`/gameweek/${lastFinished.id}`}
          className="rounded-lg bg-fpl-purple px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-fpl-purple-light"
        >
          Se {lastFinished.name} &rarr;
        </Link>
      </div>
    );
  }

  // Fetch live data and picks for all managers
  const entries = standings.standings.results;
  const [liveData, ...picksResults] = await Promise.all([
    getLiveEvent(activeEvent.id),
    ...entries.map(e =>
      getGameweekPicks(e.entry, activeEvent.id).catch(() => null)
    ),
  ]);

  // Build lookup maps as plain objects (serializable for client component)
  const playerMapObj: Record<number, Player> = {};
  bootstrap.elements.forEach(p => { playerMapObj[p.id] = p; });

  const teamMapObj: Record<number, string> = {};
  bootstrap.teams.forEach((t: FPLTeam) => { teamMapObj[t.id] = t.short_name; });

  // Build managers data
  const managers = entries.map((entry, i) => {
    const picksData = picksResults[i];
    return {
      entry,
      picks: picksData?.picks || null,
      activeChip: picksData?.active_chip || null,
    };
  });

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-fpl-muted hover:text-fpl-green transition-colors">
        &larr; Tilbake til ligatabell
      </Link>

      <LiveDashboard
        currentEvent={activeEvent}
        managers={managers}
        initialLiveData={liveData}
        playerMap={playerMapObj}
        teamMap={teamMapObj}
      />
    </div>
  );
}
