import React, { useState, useEffect } from 'react';
import { Search, X, Activity, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Trade } from '../../types/trade';

interface GlobalCommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  onSelectTrade: (id: string) => void;
  onOpenLogger: () => void;
}

export const GlobalCommandDialog: React.FC<GlobalCommandDialogProps> = ({
  isOpen,
  onClose,
  trades,
  onSelectTrade,
  onOpenLogger,
}) => {
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTrades = trades.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.instrument.toLowerCase().includes(q) ||
      t.setupName.toLowerCase().includes(q) ||
      t.direction.toLowerCase().includes(q) ||
      t.session.toLowerCase().includes(q) ||
      t.mistakes.some((m) => m.label.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="bg-obsidian-surface border border-obsidian-highlight rounded-2xl w-full max-w-2xl shadow-command overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-obsidian-highlight flex items-center gap-3 bg-obsidian-base">
          <Search className="w-5 h-5 text-trade-emerald" />
          <input
            type="text"
            autoFocus
            placeholder="Search tickers (NQ, ES, NVDA), setups, or mistakes... (Esc to dismiss)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-white placeholder-obsidian-slate/60 outline-none"
          />
          <button
            onClick={onClose}
            className="text-obsidian-slate hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 font-mono text-xs">
          {/* Quick Action: New Log */}
          <div
            onClick={() => {
              onClose();
              onOpenLogger();
            }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-obsidian-elevated text-trade-emerald cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="font-bold">+ Open 3-Act Narrative Trade Logger</span>
            </div>
            <kbd className="bg-obsidian-base px-2 py-0.5 rounded border border-obsidian-highlight text-obsidian-slate">
              N
            </kbd>
          </div>

          <div className="text-[10px] uppercase text-obsidian-slate px-3 pt-2 pb-1 font-semibold">
            Execution Case Studies ({filteredTrades.length})
          </div>

          {filteredTrades.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                onSelectTrade(t.id);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-obsidian-elevated text-white cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{t.instrument}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    t.direction === 'long' ? 'bg-trade-emerald/20 text-trade-emerald' : 'bg-trade-crimson/20 text-trade-crimson'
                  }`}
                >
                  {t.direction}
                </span>
                <span className="text-obsidian-slate text-[11px] font-sans">{t.setupName}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-bold tabular-nums ${
                    t.realizedR >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'
                  }`}
                >
                  {t.realizedR >= 0 ? '+' : ''}{t.realizedR.toFixed(2)}R
                </span>
                {t.isFullyCompliant ? (
                  <ShieldCheck className="w-4 h-4 text-trade-emerald" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-trade-crimson" />
                )}
                <ArrowRight className="w-3.5 h-3.5 text-obsidian-slate group-hover:text-trade-emerald transition-colors" />
              </div>
            </div>
          ))}

          {filteredTrades.length === 0 && (
            <div className="py-8 text-center text-obsidian-slate">
              No matching trades or tags found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
