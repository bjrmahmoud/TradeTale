import React, { useState } from 'react';
import { PLAYBOOK_SETUPS } from '../../lib/constants';
import { PlaybookSetup, Trade } from '../../types/trade';
import { Layers, Plus, ShieldCheck, AlertTriangle, TrendingUp, BookOpen, Check } from 'lucide-react';

interface PlaybookMatrixViewProps {
  trades: Trade[];
}

export const PlaybookMatrixView: React.FC<PlaybookMatrixViewProps> = ({ trades }) => {
  const [setups, setSetups] = useState<PlaybookSetup[]>(PLAYBOOK_SETUPS);
  const [selectedSetup, setSelectedSetup] = useState<PlaybookSetup>(setups[0]);

  // Compute live empirical statistics from actual logged trades for each setup
  const enrichedSetups = setups.map((setup) => {
    const setupTrades = trades.filter((t) => t.setupName === setup.name);
    const winTrades = setupTrades.filter((t) => t.realizedR > 0);
    const lossTrades = setupTrades.filter((t) => t.realizedR <= 0);

    const winRate = setupTrades.length > 0 ? (winTrades.length / setupTrades.length) * 100 : setup.winRate;
    const avgWinR = winTrades.length > 0 ? winTrades.reduce((acc, t) => acc + t.realizedR, 0) / winTrades.length : 2.5;
    const avgLossR = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((acc, t) => acc + t.realizedR, 0)) / lossTrades.length : 1.0;

    const expectancy = (winRate / 100) * avgWinR - ((100 - winRate) / 100) * avgLossR;

    return {
      ...setup,
      totalTrades: setupTrades.length || setup.totalTrades,
      winRate: Number(winRate.toFixed(1)),
      expectancyR: Number(expectancy.toFixed(2)),
    };
  });

  const toggleRetirement = (id: string) => {
    setSetups((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isRetired: !s.isRetired } : s))
    );
  };

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Header */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-trade-emerald" />
            <h2 className="font-sans font-bold text-white text-lg tracking-wide">
              Playbook Strategy Models & Mathematical Expectancy
            </h2>
          </div>
          <p className="text-xs text-obsidian-slate mt-1 font-mono">
            Tradestory continuously computes the empirical edge of your playbook setups. Strategies with negative mathematical expectancy ($E &lt; 0$) are flagged for retirement.
          </p>
        </div>
      </div>

      {/* Grid of Setups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrichedSetups.map((setup) => {
          const isNegative = setup.expectancyR < 0;

          return (
            <div
              key={setup.id}
              className={`bg-obsidian-surface border rounded-2xl p-5 space-y-4 transition-all ${
                setup.isRetired
                  ? 'border-trade-crimson/40 opacity-75'
                  : 'border-obsidian-border hover:border-obsidian-highlight'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-white text-base">{setup.name}</h3>
                    {setup.isRetired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-trade-crimson/20 text-trade-crimson border border-trade-crimson/40">
                        RETIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-trade-emerald/20 text-trade-emerald border border-trade-emerald/40">
                        ACTIVE EDGE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-obsidian-slate font-sans mt-1 leading-relaxed">
                    {setup.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleRetirement(setup.id)}
                  className={`text-[11px] font-mono px-3 py-1 rounded-lg border transition-colors ${
                    setup.isRetired
                      ? 'bg-obsidian-base border-obsidian-highlight text-obsidian-slate hover:text-white'
                      : 'bg-trade-crimson/15 border-trade-crimson/40 text-trade-crimson hover:bg-trade-crimson/25'
                  }`}
                >
                  {setup.isRetired ? 'Reactivate' : 'Retire Setup'}
                </button>
              </div>

              {/* Empirical Stats Grid */}
              <div className="grid grid-cols-4 gap-2 bg-obsidian-base p-3 rounded-xl border border-obsidian-highlight font-mono text-xs text-center">
                <div>
                  <span className="text-[10px] text-obsidian-slate uppercase block">Win Rate</span>
                  <span className="text-white font-bold text-sm">{setup.winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-obsidian-slate uppercase block">Target R:R</span>
                  <span className="text-white font-bold text-sm">1:{setup.targetRR}</span>
                </div>
                <div>
                  <span className="text-[10px] text-obsidian-slate uppercase block">Logged</span>
                  <span className="text-white font-bold text-sm">{setup.totalTrades}</span>
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
          );
        })}
      </div>
    </div>
  );
};
