'use client';

import type { GameweekHistory } from '@/lib/types';

interface ManagerForm {
  entryName: string;
  playerName: string;
  recentPoints: number[];
  formTotal: number;
}

interface FormCardsProps {
  managerHistories: {
    entryName: string;
    playerName: string;
    history: GameweekHistory[];
  }[];
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const padding = 2;

  const pathPoints = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - (p - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = pathPoints.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot at last point */}
      <circle
        cx={parseFloat(pathPoints[pathPoints.length - 1].split(',')[0])}
        cy={parseFloat(pathPoints[pathPoints.length - 1].split(',')[1])}
        r={3}
        fill={color}
      />
    </svg>
  );
}

export default function FormCards({ managerHistories }: FormCardsProps) {
  // Calculate form for each manager (sum of last 5 GW points)
  const forms: ManagerForm[] = managerHistories.map((m) => {
    const sorted = [...m.history].sort((a, b) => b.event - a.event);
    const recent = sorted.slice(0, 5);
    const recentPoints = recent.map(h => h.points).reverse(); // oldest → newest
    const formTotal = recentPoints.reduce((sum, p) => sum + p, 0);

    return {
      entryName: m.entryName,
      playerName: m.playerName,
      recentPoints,
      formTotal,
    };
  });

  // Sort by form
  const sorted = [...forms].sort((a, b) => b.formTotal - a.formTotal);

  const hot = sorted.slice(0, 3);
  const not = sorted.slice(-3); // rank n-2, n-1, n (worst at bottom)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* HOT card */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">HOT</h3>
          <span className="text-[10px] text-fpl-muted ml-auto">Siste 5 GWs</span>
        </div>
        <div className="space-y-3">
          {hot.map((m, i) => (
            <div key={m.entryName} className="flex items-center gap-3">
              <span className={`w-5 text-center text-sm font-bold ${
                i === 0 ? 'text-emerald-400' : 'text-emerald-400/70'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.entryName}</div>
                <div className="text-[11px] text-fpl-muted truncate">{m.playerName}</div>
              </div>
              <Sparkline points={m.recentPoints} color="#34d399" />
              <div className="text-right min-w-[40px]">
                <div className="text-sm font-bold text-emerald-400">{m.formTotal}</div>
                <div className="text-[10px] text-fpl-muted">poeng</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOT card */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🥶</span>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">NOT</h3>
          <span className="text-[10px] text-fpl-muted ml-auto">Siste 5 GWs</span>
        </div>
        <div className="space-y-3">
          {not.map((m, i) => (
            <div key={m.entryName} className="flex items-center gap-3">
              <span className={`w-5 text-center text-sm font-bold ${
                i === 0 ? 'text-rose-400' : 'text-rose-400/70'
              }`}>
                {sorted.length - 2 + i}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.entryName}</div>
                <div className="text-[11px] text-fpl-muted truncate">{m.playerName}</div>
              </div>
              <Sparkline points={m.recentPoints} color="#fb7185" />
              <div className="text-right min-w-[40px]">
                <div className="text-sm font-bold text-rose-400">{m.formTotal}</div>
                <div className="text-[10px] text-fpl-muted">poeng</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
