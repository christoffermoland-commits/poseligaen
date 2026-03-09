'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect, Suspense } from 'react';
import LeagueSearch from '@/components/league/LeagueSearch';

const links = [
  { href: '/', label: 'Ligatabell' },
  { href: '/live', label: 'Live', isLive: true },
  { href: '/stats', label: 'Statistikk' },
];

const DEFAULT_LEAGUE_ID = process.env.NEXT_PUBLIC_FPL_LEAGUE_ID || '464370';

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchEntries, setSearchEntries] = useState<{ entry: number; entry_name: string; player_name: string }[] | null>(null);

  const currentLeagueId = searchParams.get('league') || DEFAULT_LEAGUE_ID;

  const openSearch = useCallback(async () => {
    setSearchOpen(true);
    if (!searchEntries) {
      try {
        const res = await fetch(`/api/fpl/league/${currentLeagueId}`);
        const data = await res.json();
        setSearchEntries(data.standings.results.map((e: { entry: number; entry_name: string; player_name: string }) => ({
          entry: e.entry,
          entry_name: e.entry_name,
          player_name: e.player_name,
        })));
      } catch {
        setSearchEntries([]);
      }
    }
  }, [currentLeagueId, searchEntries]);

  // Reset entries cache when league changes
  useEffect(() => {
    setSearchEntries(null);
  }, [currentLeagueId]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-fpl-border bg-fpl-dark/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/pl-logo.png" alt="Premier League" width={36} height={36} className="rounded" />
            <span className="bg-gradient-to-r from-fpl-green to-fpl-cyan bg-clip-text text-xl font-bold text-transparent">
              Pøseligaen
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  pathname === link.href
                    ? 'bg-fpl-purple text-white'
                    : 'text-fpl-muted hover:bg-fpl-surface-light hover:text-foreground'
                )}
              >
                {'isLive' in link && link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
                {link.label}
              </Link>
            ))}

            {/* Search button */}
            <button
              onClick={openSearch}
              className="ml-1 rounded-lg px-3 py-2 text-fpl-muted transition-colors hover:bg-fpl-surface-light hover:text-foreground"
              title="Søk etter lag"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              onClick={openSearch}
              className="p-2 text-fpl-muted"
              title="Søk"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              className="p-2 text-fpl-muted"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-fpl-border px-4 pb-3 sm:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-fpl-purple text-white'
                    : 'text-fpl-muted hover:bg-fpl-surface-light hover:text-foreground'
                )}
              >
                {'isLive' in link && link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search modal */}
      {searchOpen && searchEntries && (
        <LeagueSearch
          entries={searchEntries}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Loading state while fetching entries */}
      {searchOpen && !searchEntries && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div className="rounded-xl border border-fpl-border bg-fpl-dark p-8 shadow-2xl">
            <div className="flex items-center gap-3 text-fpl-muted">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Laster lagdata...
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  );
}
