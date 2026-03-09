'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ManagerLeagueEntry } from '@/lib/types';

interface SearchEntry {
  entry: number;
  entry_name: string;
  player_name: string;
}

export default function LeagueSearch({
  entries,
  onClose,
}: {
  entries: SearchEntry[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SearchEntry | null>(null);
  const [leagues, setLeagues] = useState<ManagerLeagueEntry[] | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.length > 0
    ? entries.filter(e =>
        e.entry_name.toLowerCase().includes(query.toLowerCase()) ||
        e.player_name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectEntry = async (entry: SearchEntry) => {
    setSelectedEntry(entry);
    setLoadingLeagues(true);
    setLeagues(null);
    try {
      const res = await fetch(`/api/fpl/entry/${entry.entry}`);
      const data = await res.json();
      // Filter to only private/custom leagues (league_type === 'x'), exclude global ones
      const classicLeagues = (data.leagues?.classic || []).filter(
        (l: ManagerLeagueEntry) => l.league_type === 'x'
      );
      const h2hLeagues = data.leagues?.h2h || [];
      setLeagues([...classicLeagues, ...h2hLeagues]);
    } catch {
      setLeagues([]);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleSelectLeague = (leagueId: number) => {
    router.push(`/?league=${leagueId}`);
    onClose();
  };

  const handleBack = () => {
    setSelectedEntry(null);
    setLeagues(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-fpl-border bg-fpl-dark shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-fpl-border px-4 py-3">
          {selectedEntry ? (
            <button onClick={handleBack} className="text-fpl-muted hover:text-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <svg className="h-5 w-5 text-fpl-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          {selectedEntry ? (
            <div className="flex-1">
              <div className="text-sm font-medium">{selectedEntry.entry_name}</div>
              <div className="text-xs text-fpl-muted">{selectedEntry.player_name}</div>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk etter lagnavn eller manager..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-fpl-muted"
            />
          )}
          <button onClick={onClose} className="text-fpl-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search results */}
        {!selectedEntry && (
          <div className="max-h-80 overflow-y-auto">
            {query.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-fpl-muted">
                Skriv for å søke blant lagene i ligaen
              </div>
            )}
            {query.length > 0 && filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-fpl-muted">
                Ingen treff for &quot;{query}&quot;
              </div>
            )}
            {filtered.map(entry => (
              <button
                key={entry.entry}
                onClick={() => handleSelectEntry(entry)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-fpl-surface"
              >
                <div>
                  <div className="text-sm font-medium">{entry.entry_name}</div>
                  <div className="text-xs text-fpl-muted">{entry.player_name}</div>
                </div>
                <svg className="h-4 w-4 text-fpl-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* League results */}
        {selectedEntry && (
          <div className="max-h-80 overflow-y-auto">
            {loadingLeagues && (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-fpl-muted">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Henter ligaer...
              </div>
            )}
            {leagues && leagues.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-fpl-muted">
                Ingen private ligaer funnet
              </div>
            )}
            {leagues && leagues.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1 text-xs font-medium text-fpl-muted uppercase tracking-wider">
                  Ligaer ({leagues.length})
                </div>
                {leagues.map(league => (
                  <button
                    key={league.id}
                    onClick={() => handleSelectLeague(league.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-fpl-surface"
                  >
                    <div>
                      <div className="text-sm font-medium">{league.name}</div>
                      <div className="text-xs text-fpl-muted">
                        Rank {league.entry_rank} av {league.rank_count}
                        {league.scoring !== 'c' && ' • H2H'}
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-fpl-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
