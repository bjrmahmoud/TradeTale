import React, { useMemo } from 'react';
import { AlertOctagon, TrendingDown, ShieldAlert, Sparkles, Tag, Plus, Trash2 } from 'lucide-react';
import { MistakeDefinition, TradeMistake, LeakSeverity, MistakeCategory } from '../../types/trade';
import { SYSTEM_MISTAKES } from '../../lib/constants';

interface MistakeDiagnosticEngineProps {
  initialRiskDollars: number; // 1R value in dollars
  plannedTargetR: number;
  realizedR: number;
  activeMistakes: TradeMistake[];
  onChange: (mistakes: TradeMistake[]) => void;
  isEditable?: boolean;
}

export const MistakeDiagnosticEngine: React.FC<MistakeDiagnosticEngineProps> = ({
  initialRiskDollars,
  plannedTargetR,
  realizedR,
  activeMistakes,
  onChange,
  isEditable = true,
}) => {
  // Automated mathematical suggested leak computation
  const suggestedLeak = useMemo(() => {
    let rLeak = 0;
    // Early exit leak
    if (realizedR > 0 && realizedR < plannedTargetR) {
      rLeak = plannedTargetR - realizedR;
    }
    // Widened stop loss leak
    else if (realizedR < -1.0) {
      rLeak = Math.abs(realizedR) - 1.0;
    }

    return {
      r: Number(rLeak.toFixed(2)),
      fiat: Number((rLeak * initialRiskDollars).toFixed(2)),
    };
  }, [realizedR, plannedTargetR, initialRiskDollars]);

  const toggleMistake = (definition: MistakeDefinition) => {
    if (!isEditable) return;
    const exists = activeMistakes.some((m) => m.mistakeId === definition.id);

    if (exists) {
      onChange(activeMistakes.filter((m) => m.mistakeId !== definition.id));
    } else {
      const defaultR = activeMistakes.length === 0 ? suggestedLeak.r : 0.5;
      const defaultFiat = defaultR * initialRiskDollars;

      const newMistake: TradeMistake = {
        mistakeId: definition.id,
        code: definition.code,
        label: definition.label,
        category: definition.category,
        severity: definition.category === 'risk_management' ? 'catastrophic' : 'moderate',
        costOfMistakeR: defaultR,
        costOfMistakeFiat: defaultFiat,
        triggerEmotion: '',
        ruleTakeaway: '',
      };
      onChange([...activeMistakes, newMistake]);
    }
  };

  const updateMistake = (mistakeId: string, updates: Partial<TradeMistake>) => {
    if (!isEditable) return;
    onChange(
      activeMistakes.map((m) => {
        if (m.mistakeId !== mistakeId) return m;
        const updated = { ...m, ...updates };
        if ('costOfMistakeR' in updates && updates.costOfMistakeR !== undefined) {
          updated.costOfMistakeFiat = Number((updates.costOfMistakeR * initialRiskDollars).toFixed(2));
        }
        return updated;
      })
    );
  };

  const removeMistake = (mistakeId: string) => {
    if (!isEditable) return;
    onChange(activeMistakes.filter((m) => m.mistakeId !== mistakeId));
  };

  const totalLeakR = activeMistakes.reduce((acc, m) => acc + m.costOfMistakeR, 0);
  const totalLeakFiat = activeMistakes.reduce((acc, m) => acc + m.costOfMistakeFiat, 0);

  return (
    <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-5">
      {/* Header with Quantified Impact Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-highlight pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-trade-crimson" />
            <h3 className="font-sans font-semibold text-white text-base tracking-wide">
              Mistake Attribution & Execution Leak Diagnostics
            </h3>
          </div>
          <p className="text-xs text-obsidian-slate mt-1 font-mono">
            Isolates behavioral noise from mathematical edge by pricing execution errors in $R$-units.
          </p>
        </div>

        {/* Quantified Cost of Mistake Pill */}
        <div className="flex items-center gap-3 bg-obsidian-base border border-trade-crimson/30 px-4 py-2.5 rounded-xl shadow-lg">
          <TrendingDown className="w-5 h-5 text-trade-crimson" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-obsidian-slate uppercase tracking-wider">
              Quantified Capital Leak
            </span>
            <span className="font-mono text-base font-bold text-trade-crimson tabular-nums">
              -{totalLeakR.toFixed(2)}R{' '}
              <span className="text-xs font-normal text-obsidian-slate">
                (-${totalLeakFiat.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Leak Notification Banner */}
      {suggestedLeak.r > 0 && activeMistakes.length === 0 && (
        <div className="bg-trade-amber/10 border border-trade-amber/30 rounded-lg p-3 flex items-center justify-between gap-3 text-xs font-mono text-trade-amber">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-trade-amber shrink-0" />
            <span>
              Automated Leak Detection: This trade forfeited approximately{' '}
              <strong className="underline font-bold">-{suggestedLeak.r.toFixed(2)}R (-${suggestedLeak.fiat.toFixed(0)})</strong>{' '}
              relative to planned targets or stop boundaries.
            </span>
          </div>
          {isEditable && (
            <span className="text-[10px] bg-trade-amber/20 px-2 py-0.5 rounded text-trade-amber shrink-0">
              Select tag below to attribute
            </span>
          )}
        </div>
      )}

      {/* Multi-Category Mistake Selection Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-obsidian-slate flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Catalog Execution Faults
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['entry', 'risk_management', 'exit'] as MistakeCategory[]).map((category) => (
            <div key={category} className="space-y-2">
              <div className="text-[11px] font-mono font-semibold uppercase text-obsidian-slate px-1">
                {category === 'entry' ? '1. Entry Faults' : category === 'risk_management' ? '2. Risk / Sizing Faults' : '3. Exit / Trade Mgmt'}
              </div>
              <div className="flex flex-col gap-1.5">
                {SYSTEM_MISTAKES.filter((m) => m.category === category).map((mistake) => {
                  const isSelected = activeMistakes.some((m) => m.mistakeId === mistake.id);
                  return (
                    <button
                      key={mistake.id}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => toggleMistake(mistake)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-trade-crimson/15 border-trade-crimson text-white shadow-glow-crimson'
                          : 'bg-obsidian-base/60 border-obsidian-highlight text-obsidian-slate hover:border-obsidian-border hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px] text-slate-200">{mistake.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-trade-crimson" />}
                      </div>
                      <p className="text-[10px] text-obsidian-slate/80 mt-1 line-clamp-2">
                        {mistake.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Granular Post-Mortem Autopsy Blocks for Active Mistakes */}
      {activeMistakes.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-obsidian-highlight">
          <div className="text-xs font-mono uppercase tracking-wider text-obsidian-slate flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-trade-amber" />
            Behavioral Root Cause & Invalidation Autopsy
          </div>

          <div className="space-y-3">
            {activeMistakes.map((active) => {
              const def = SYSTEM_MISTAKES.find((m) => m.id === active.mistakeId);
              return (
                <div
                  key={active.mistakeId}
                  className="bg-obsidian-base border border-obsidian-highlight rounded-xl p-4 space-y-3"
                >
                  {/* Top: Mistake Tag & Cost Input */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-obsidian-border/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-trade-crimson">
                        {active.label}
                      </span>
                      <span className="text-[10px] font-mono text-obsidian-slate bg-obsidian-surface px-2 py-0.5 rounded border border-obsidian-highlight">
                        {active.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-obsidian-slate">Leak:</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          disabled={!isEditable}
                          value={active.costOfMistakeR}
                          onChange={(e) =>
                            updateMistake(active.mistakeId, {
                              costOfMistakeR: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-16 bg-obsidian-surface border border-obsidian-border rounded px-2 py-1 text-xs font-mono text-trade-crimson font-bold text-right"
                        />
                        <span className="text-xs font-mono text-obsidian-slate">R</span>
                      </div>
                      <span className="text-xs font-mono text-obsidian-slate tabular-nums">
                        (-${active.costOfMistakeFiat.toFixed(0)})
                      </span>
                      {isEditable && (
                        <button
                          onClick={() => removeMistake(active.mistakeId)}
                          className="text-obsidian-slate hover:text-trade-crimson p-1 transition-colors"
                          title="Remove fault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trigger Emotion & Playbook Rule Counter-Measure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-obsidian-slate block mb-1">
                        Trigger & Neuro-Emotional State
                      </label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        placeholder="e.g. Saw 5m aggressive delta surge, feared missing the session high"
                        value={active.triggerEmotion}
                        onChange={(e) =>
                          updateMistake(active.mistakeId, { triggerEmotion: e.target.value })
                        }
                        className="w-full bg-obsidian-surface border border-obsidian-border rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-obsidian-slate/40 focus:border-trade-emerald outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-obsidian-slate block mb-1">
                        Refined Playbook Rule / Actionable Takeaway
                      </label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        placeholder="e.g. Must wait for 2m candle closure confirming break of structure"
                        value={active.ruleTakeaway}
                        onChange={(e) =>
                          updateMistake(active.mistakeId, { ruleTakeaway: e.target.value })
                        }
                        className="w-full bg-obsidian-surface border border-obsidian-border rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-obsidian-slate/40 focus:border-trade-emerald outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
