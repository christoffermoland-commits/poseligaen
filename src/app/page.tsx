import { getLeagueStandings, getBootstrapData, getLiveEvent, getGameweekPicks } from '@/lib/fpl-api';
import { FPL_LEAGUE_ID } from '@/lib/config';
import LeagueTable from '@/components/league/LeagueTable';
import LiveLeagueTable from '@/components/league/LiveLeagueTable';
import Link from 'next/link';
import type { Pick as FPLPick } from '@/lib/types';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const params = await searchParams;
  const leagueId = params.league || FPL_LEAGUE_ID;

  const [standings, bootstrap] = await Promise.all([
    getLeagueStandings(leagueId),
    getBootstrapData(),
  ]);

  const currentEvent = bootstrap.events.find(e => e.is_current)
    || bootstrap.events.filter(e => e.finished).pop();

  const entries = standings.standings.results;
  const isLive = !!(currentEvent && currentEvent.is_current && !currentEvent.finished);
  const isOtherLeague = leagueId !== FPL_LEAGUE_ID;

  // If live GW, fetch picks and live data for all managers
  let liveData = null;
  let managerPicks: { entryId: number; picks: FPLPick[] | null; activeChip: string | null }[] = [];

  if (isLive && currentEvent) {
    const [live, ...picksResults] = await Promise.all([
      getLiveEvent(currentEvent.id),
      ...entries.map(e =>
        getGameweekPicks(e.entry, currentEvent.id).catch(() => null)
      ),
    ]);
    liveData = live;
    managerPicks = entries.map((entry, i) => ({
      entryId: entry.entry,
      picks: picksResults[i]?.picks || null,
      activeChip: picksResults[i]?.active_chip || null,
    }));
  }

  return (
    <div className="space-y-6">
      {isOtherLeague && (
        <Link href="/" className="text-sm text-fpl-muted hover:text-fpl-green transition-colors">
          &larr; Tilbake til Pøseligaen
        </Link>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{standings.league.name}</h1>
          <p className="text-sm text-fpl-muted">
            {currentEvent ? `Gameweek ${currentEvent.id}` : 'Sesong ikke startet'}
            {currentEvent && ` • Snitt: ${currentEvent.average_entry_score} poeng`}
          </p>
        </div>
        {currentEvent && (
          <div className="flex gap-3">
            <div className="rounded-lg border border-fpl-border bg-fpl-surface px-3 py-2 text-center">
              <div className="text-xs text-fpl-muted">Høyeste</div>
              <div className="text-lg font-bold text-fpl-green">{currentEvent.highest_score}</div>
            </div>
            <div className="rounded-lg border border-fpl-border bg-fpl-surface px-3 py-2 text-center">
              <div className="text-xs text-fpl-muted">Snitt</div>
              <div className="text-lg font-bold text-fpl-cyan">{currentEvent.average_entry_score}</div>
            </div>
          </div>
        )}
      </div>

      {isLive && liveData && currentEvent ? (
        <LiveLeagueTable
          entries={entries}
          managerPicks={managerPicks}
          initialLiveData={liveData}
          eventId={currentEvent.id}
        />
      ) : (
        <LeagueTable entries={entries} />
      )}
    </div>
  );
}
