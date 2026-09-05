import React, { useMemo } from 'react';
import { Trade } from '../../types/trade';
import { PLAYBOOK_SETUPS } from '../../lib/constants';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Layers,
  BarChart2,
  Percent,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface DisciplineAnalyticsViewProps {
  trades: Trade[];
}

export const DisciplineAnalyticsView: React.FC<DisciplineAnalyticsViewProps> = ({ trades }) => {
  // 1. Calculate Dual Equity Trajectories (Disciplined Curve)
  const equityPoints = useMemo(() => {
    let runningActualR = 0;
    let runningCompliantR = 0;

    // Chronological order
    const sorted = [...trades].reverse();

    const points = sorted.map((trade, idx) => {
      runningActualR += trade.realizedR;

      if (trade.isFullyCompliant) {
        runningCompliantR += trade.realizedR;
      } else {
        // Reconstitute equity: if trade was an emotional mistake, compliant outcome is 0 or capped at -1R
        const compliantR = trade.realizedR < -1.0 ? -1.0 : 0;
        runningCompliantR += compliantR;
      }

      return {
        tradeIndex: idx + 1,
        ticker: trade.instrument,
        actualR: Number(runningActualR.toFixed(2)),
        compliantR: Number(runningCompliantR.toFixed(2)),
        leakDeltaR: Number((runningCompliantR - runningActualR).toFixed(2)),
      };
    });

    return points;
  }, [trades]);

  const latestPoint = equityPoints[equityPoints.length - 1] || {
    actualR: 0,
    compliantR: 0,
    leakDeltaR: 0,
  };

  // 2. Compute Pareto Leak Distribution
  const paretoData = useMemo(() => {
    const map = new Map<string, { label: string; count: number; totalCostR: number }>();

    trades.forEach((t) => {
      t.mistakes.forEach((m) => {
        const curr = map.get(m.code) || { label: m.label, count: 0, totalCostR: 0 };
        map.set(m.code, {
          label: m.label,
          count: curr.count + 1,
          totalCostR: curr.totalCostR + m.costOfMistakeR,
        });
      });
    });

    const items = Array.from(map.entries())
      .map(([code, data]) => ({
        code,
        label: data.label,
        count: data.count,
        totalCostR: Number(data.totalCostR.toFixed(2)),
      }))
      .sort((a, b) => b.totalCostR - a.totalCostR);

    const grandTotal = items.reduce((acc, i) => acc + i.totalCostR, 0);
    let accum = 0;

    return items.map((i) => {
      accum += i.totalCostR;
      return {
        ...i,
        cumulativePct: grandTotal > 0 ? Math.round((accum / grandTotal) * 100) : 0,
      };
    });
  }, [trades]);

  const totalGlobalLeakR = paretoData.reduce((acc, i) => acc + i.totalCostR, 0);

  // SVG Chart Boundaries
  const maxR = Math.max(...equityPoints.map((p) => Math.max(p.actualR, p.compliantR, 6)));
  const minR = Math.min(...equityPoints.map((p) => Math.min(p.actualR, p.compliantR, -2)));
  const rangeR = maxR - minR || 1;

  const getSvgY = (val: number) => {
    return 340 - ((val - minR) / rangeR) * 280;
  };

  const getSvgX = (idx: number) => {
    if (equityPoints.length <= 1) return 80;
    return 80 + (idx / (equityPoints.length - 1)) * 960;
  };

  const actualPath = equityPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(i)} ${getSvgY(p.actualR)}`)
    .join(' ');

  const compliantPath = equityPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(i)} ${getSvgY(p.compliantR)}`)
    .join(' ');

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Top Banner: Total Discipline Leak Quantification */}
      <div className="bg-gradient-to-r from-obsidian-surface via-obsidian-elevated to-obsidian-surface border border-trade-crimson/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-trade-crimson" />
            <h2 className="font-sans font-bold text-white text-lg tracking-wide">
              Discipline Overlay & Empirical Capital Leak Analysis
            </h2>
          </div>
          <p className="text-xs text-obsidian-slate mt-1 font-mono max-w-2xl">
            This module decouples your edge from emotional friction. The emerald curve illustrates your account trajectory if 100% of trades satisfied playbook rules without early panic closes or stop widening.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-obsidian-base border border-trade-crimson/50 px-5 py-3 rounded-xl">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-obsidian-slate uppercase">
              Accumulated Discipline Leak
            </span>
            <span className="font-mono text-2xl font-bold text-trade-crimson tabular-nums">
              -{latestPoint.leakDeltaR.toFixed(2)}R
            </span>
            <span className="text-xs font-mono text-obsidian-slate">
              (-${(latestPoint.leakDeltaR * 500).toLocaleString('en-US', { minimumFractionDigits: 0 })} forfeited capital)
            </span>
          </div>
        </div>
      </div>

      {/* Disciplined Curve SVG Overlay Chart */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian-highlight pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-trade-emerald" />
            <h3 className="font-sans font-semibold text-white text-sm">
              Discipline Overlay Curve (Realized Equity vs 100% Rule Adherent)
            </h3>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-trade-emerald rounded-full" />
              <span className="text-slate-200">100% Rule Compliant (+{latestPoint.compliantR}R)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-trade-crimson border-b border-dashed" />
              <span className="text-slate-200">Actual Realized (+{latestPoint.actualR}R)</span>
            </div>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="w-full aspect-[21/9] min-h-[300px] bg-obsidian-base border border-obsidian-border rounded-xl overflow-hidden p-2 relative">
          <svg viewBox="0 0 1120 400" className="w-full h-full">
            <defs>
              <linearGradient id="leakAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Zero Axis */}
            <line
              x1="60"
              y1={getSvgY(0)}
              x2="1080"
              y2={getSvgY(0)}
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="30" y={getSvgY(0) + 4} fill="#64748b" fontFamily="monospace" fontSize="11">
              0.0R
            </text>

            {/* Upper Grid */}
            <line x1="60" y1={getSvgY(maxR)} x2="1080" y2={getSvgY(maxR)} stroke="#1e293b" strokeWidth="1" />
            <text x="25" y={getSvgY(maxR) + 4} fill="#64748b" fontFamily="monospace" fontSize="11">
              +{maxR.toFixed(1)}R
            </text>

            {/* Lower Grid */}
            <line x1="60" y1={getSvgY(minR)} x2="1080" y2={getSvgY(minR)} stroke="#1e293b" strokeWidth="1" />
            <text x="25" y={getSvgY(minR) + 4} fill="#64748b" fontFamily="monospace" fontSize="11">
              {minR.toFixed(1)}R
            </text>

            {/* Compliant Trajectory (Emerald Line) */}
            <path d={compliantPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

            {/* Actual Realized Trajectory (Crimson Dashed Line) */}
            <path
              d={actualPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Interactive Data Points */}
            {equityPoints.map((pt, i) => (
              <g key={i}>
                <circle cx={getSvgX(i)} cy={getSvgY(pt.compliantR)} r="4" fill="#10b981" />
                <circle cx={getSvgX(i)} cy={getSvgY(pt.actualR)} r="4" fill="#ef4444" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Bottom Grid: Pareto Leak Distribution & Playbook Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Leak Distribution */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-highlight pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-trade-crimson" />
              <h3 className="font-sans font-semibold text-white text-base">
                Pareto Leak Distribution (80/20 Rule)
              </h3>
            </div>
            <span className="text-xs font-mono text-obsidian-slate">
              Ranked by capital destroyed
            </span>
          </div>

          <div className="space-y-3">
            {paretoData.length === 0 ? (
              <p className="text-xs font-mono text-obsidian-slate py-8 text-center">
                Zero rule mistakes logged! 100% adherence maintained.
              </p>
            ) : (
              paretoData.map((item, idx) => (
                <div key={item.code} className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-obsidian-slate">#{idx + 1}</span>
                      <span className="text-white font-semibold">{item.label}</span>
                      <span className="text-[10px] text-obsidian-slate bg-obsidian-base px-1.5 py-0.5 rounded">
                        {item.count} occurrences
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-trade-crimson font-bold">-{item.totalCostR}R</span>
                      <span className="text-[11px] text-obsidian-slate">({item.cumulativePct}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-obsidian-base rounded-full overflow-hidden flex">
                    <div
                      className="bg-trade-crimson h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (item.totalCostR / (totalGlobalLeakR || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Playbook Edge & Mathematical Expectancy Matrix */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-highlight pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-trade-cyan" />
              <h3 className="font-sans font-semibold text-white text-base">
                Playbook Setup Expectancy Matrix
              </h3>
            </div>
            <span className="text-xs font-mono text-obsidian-slate">
              E = (W% × Win R) - (L% × Loss R)
            </span>
          </div>

          <div className="space-y-2.5">
            {PLAYBOOK_SETUPS.map((setup) => (
              <div
                key={setup.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs transition-all ${
                  setup.isRetired
                    ? 'bg-obsidian-base/40 border-trade-crimson/30 opacity-70'
                    : 'bg-obsidian-base border-obsidian-highlight hover:border-obsidian-border'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm font-sans">{setup.name}</span>
                    {setup.isRetired && (
                      <span className="px-2 py-0.2 rounded text-[10px] bg-trade-crimson/20 text-trade-crimson border border-trade-crimson/40">
                        RETIRED (Negative Edge)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-obsidian-slate font-sans mt-0.5 max-w-sm line-clamp-1">
                    {setup.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-obsidian-slate uppercase block">Win Rate</span>
                    <span className="text-white font-bold">{setup.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-obsidian-slate uppercase block">Target R:R</span>
                    <span className="text-white font-bold">1:{setup.targetRR}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-obsidian-slate uppercase block">Expectancy</span>
                    <span
                      className={`font-bold text-sm ${
                        setup.expectancyR > 0 ? 'text-trade-emerald' : 'text-trade-crimson'
                      }`}
                    >
                      {setup.expectancyR > 0 ? '+' : ''}{setup.expectancyR}R
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
