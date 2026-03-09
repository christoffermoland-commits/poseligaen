import { FPL_API_BASE } from './config';
import type {
  BootstrapStatic,
  LeagueStandingsResponse,
  ManagerEntry,
  ManagerWithLeagues,
  EntryHistory,
  GameweekPicks,
  LiveEvent,
  Transfer,
} from './types';

async function fplFetch<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${FPL_API_BASE}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`FPL API error: ${res.status} for ${path}`);
  }
  return res.json();
}

export function getBootstrapData(): Promise<BootstrapStatic> {
  return fplFetch('/bootstrap-static/', 3600);
}

export function getLeagueStandings(leagueId: string): Promise<LeagueStandingsResponse> {
  return fplFetch(`/leagues-classic/${leagueId}/standings/`, 300);
}

export function getManagerEntry(teamId: string | number): Promise<ManagerEntry> {
  return fplFetch(`/entry/${teamId}/`, 600);
}

export function getManagerWithLeagues(teamId: string | number): Promise<ManagerWithLeagues> {
  return fplFetch(`/entry/${teamId}/`, 300);
}

export function getEntryHistory(teamId: string | number): Promise<EntryHistory> {
  return fplFetch(`/entry/${teamId}/history/`, 300);
}

export function getGameweekPicks(teamId: string | number, gw: number): Promise<GameweekPicks> {
  return fplFetch(`/entry/${teamId}/event/${gw}/picks/`, 3600);
}

export function getLiveEvent(eventId: number): Promise<LiveEvent> {
  return fplFetch(`/event/${eventId}/live/`, 60);
}

export function getTransfers(teamId: string | number): Promise<Transfer[]> {
  return fplFetch(`/entry/${teamId}/transfers/`, 300);
}

export async function getCurrentGameweek(): Promise<number> {
  const data = await getBootstrapData();
  const current = data.events.find(e => e.is_current);
  if (current) return current.id;
  const finished = data.events.filter(e => e.finished);
  return finished.length > 0 ? finished[finished.length - 1].id : 1;
}
