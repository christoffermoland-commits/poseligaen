'use client';

import { Press_Start_2P } from 'next/font/google';

const retroFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const GAME_URL = 'https://classicreload.com/fifa-international-soccer.html';

export default function RetroGame() {
  return (
    <div className="space-y-6">
      {/* Retro header */}
      <div className="text-center space-y-2">
        <h1
          className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-fpl-green to-fpl-cyan bg-clip-text text-transparent ${retroFont.className}`}
        >
          RETRO FIFA
        </h1>
        <p className="text-sm text-fpl-muted">
          FIFA International Soccer (1993) — EA Sports
        </p>
      </div>

      {/* Game container with CRT styling */}
      <div className="relative mx-auto max-w-3xl">
        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />

        {/* CRT frame */}
        <div className="rounded-xl border-2 border-fpl-border bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,135,0.1)]">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6 bg-gradient-to-b from-fpl-dark to-black min-h-[400px]">
            {/* Retro game art */}
            <div className="space-y-4">
              <div className="text-7xl">⚽</div>
              <div className={`space-y-1 ${retroFont.className}`}>
                <div className="text-fpl-green text-xs">FIFA</div>
                <div className="text-fpl-cyan text-[10px]">INTERNATIONAL SOCCER</div>
                <div className="text-fpl-muted text-[8px] mt-2">EA SPORTS &bull; 1993</div>
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <p className="text-sm text-fpl-muted">
                Spill det klassiske FIFA-spillet fra 1993 direkte i nettleseren via ClassicReload.com
              </p>
            </div>

            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-fpl-green px-8 py-3 text-sm font-bold text-fpl-dark transition-all hover:bg-fpl-cyan hover:scale-105 active:scale-95"
            >
              <span className={`text-xs ${retroFont.className}`}>START GAME</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <p className="text-[10px] text-fpl-muted/40">
              Åpnes i ny fane på classicreload.com
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto max-w-3xl rounded-xl border border-fpl-border bg-fpl-surface p-4 text-sm text-fpl-muted">
        <h3 className="font-bold text-foreground mb-2">Kontroller</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>⬆️⬇️⬅️➡️ Piltaster — Beveg spiller</div>
          <div>↩️ Enter — Start/Pause</div>
          <div>🅰️ Z / X — Skyt / Pass</div>
          <div>⏹️ Space — Velg</div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-fpl-muted/50">
        FIFA International Soccer er et EA Sports-spill fra 1993. Vi hoster ikke
        dette spillet.
      </p>
    </div>
  );
}
