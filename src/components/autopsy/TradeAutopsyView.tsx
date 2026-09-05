import React from 'react';
import { Trade, TradeMistake } from '../../types/trade';
import { DualImageCanvas } from '../canvas/DualImageCanvas';
import { MistakeDiagnosticEngine } from '../diagnostics/MistakeDiagnosticEngine';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Brain,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TradeAutopsyViewProps {
  trade: Trade;
  allTrades: Trade[];
  onSelectTrade: (id: string) => void;
  onUpdateTrade: (id: string, updates: Partial<Trade>) => void;
  onUpdateChart: (slot: 'pre' | 'post', imageUrl: string) => void;
  onBackToPulse?: () => void;
}

export const TradeAutopsyView: React.FC<TradeAutopsyViewProps> = ({
  trade,
  allTrades,
  onSelectTrade,
  onUpdateTrade,
  onUpdateChart,
  onBackToPulse,
}) => {
  if (!trade) return null;

  const currentIndex = allTrades.findIndex((t) => t.id === trade.id);
  const prevTrade = currentIndex > 0 ? allTrades[currentIndex - 1] : null;
  const nextTrade = currentIndex < allTrades.length - 1 ? allTrades[currentIndex + 1] : null;

  const isWin = trade.realizedR > 0;
  const isLong = trade.direction === 'long';

  const handleToggleRule = (ruleId: string) => {
    const updatedResponses = trade.ruleResponses.map((r) =>
      r.ruleId === ruleId ? { ...r, passed: !r.passed } : r
    );
    const hasFailedRules = updatedResponses.some((r) => !r.passed);
    const isCompliant = !hasFailedRules && trade.mistakes.length === 0;

    onUpdateTrade(trade.id, {
      ruleResponses: updatedResponses,
      isFullyCompliant: isCompliant,
    });
  };

  const handleMistakesChange = (newMistakes: TradeMistake[]) => {
    const hasFailedRules = trade.ruleResponses.some((r) => !r.passed);
    const isCompliant = !hasFailedRules && newMistakes.length === 0;

    onUpdateTrade(trade.id, {
      mistakes: newMistakes,
      isFullyCompliant: isCompliant,
    });
  };

  const getNeuroStateDisplay = (state: string) => {
    switch (state) {
      case 'calm_centered':
        return { label: 'Calm & Centered', color: 'text-trade-emerald', bg: 'bg-trade-emerald/15', border: 'border-trade-emerald/30' };
      case 'fomo_urge':
        return { label: 'FOMO Impulse Urge', color: 'text-trade-amber', bg: 'bg-trade-amber/15', border: 'border-trade-amber/30' };
      case 'hesitant':
        return { label: 'Hesitant / Late Fill', color: 'text-blue-400', bg: 'bg-blue-400/15', border: 'border-blue-400/30' };
      case 'chasing_price':
        return { label: 'Chasing Extended Price', color: 'text-orange-400', bg: 'bg-orange-400/15', border: 'border-orange-400/30' };
      case 'revenge_tilted':
        return { label: 'Revenge / Tilted State', color: 'text-trade-crimson', bg: 'bg-trade-crimson/15', border: 'border-trade-crimson/30' };
      default:
        return { label: state, color: 'text-slate-300', bg: 'bg-slate-800', border: 'border-slate-700' };
    }
  };

  const neuroInfo = getNeuroStateDisplay(trade.neuroState);

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Top Breadcrumb & Return to Pulse Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-obsidian-surface border border-obsidian-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          {onBackToPulse && (
            <button
              onClick={onBackToPulse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-obsidian-base hover:bg-obsidian-highlight text-trade-emerald border border-trade-emerald/40 transition-colors shadow-sm mr-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Return to Daily Pulse
            </button>
          )}
          <span className="font-mono text-xs text-obsidian-slate bg-obsidian-base px-2.5 py-1 rounded-md border border-obsidian-highlight">
            CASE STUDY #{trade.id}
          </span>
          <span className="text-obsidian-slate">•</span>
          <span className="font-mono text-xs text-trade-emerald">{trade.accountName}</span>
          <span className="text-obsidian-slate">•</span>
          <span className="font-sans text-xs text-slate-300 font-medium">{trade.setupName}</span>
        </div>

        {/* Next / Previous Trade Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevTrade && onSelectTrade(prevTrade.id)}
            disabled={!prevTrade}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              prevTrade
                ? 'bg-obsidian-base text-white hover:bg-obsidian-highlight border border-obsidian-border'
                : 'bg-obsidian-base/50 text-obsidian-slate/40 border border-obsidian-highlight/50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev Trade
          </button>
          <span className="text-xs font-mono text-obsidian-slate px-2">
            {currentIndex + 1} of {allTrades.length}
          </span>
          <button
            onClick={() => nextTrade && onSelectTrade(nextTrade.id)}
            disabled={!nextTrade}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              nextTrade
                ? 'bg-obsidian-base text-white hover:bg-obsidian-highlight border border-obsidian-border'
                : 'bg-obsidian-base/50 text-obsidian-slate/40 border border-obsidian-highlight/50 cursor-not-allowed'
            }`}
          >
            Next Trade <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Execution Telemetry Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Instrument & Direction */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Instrument & Side
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono font-bold text-xl text-white">{trade.instrument}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                isLong ? 'bg-trade-emerald/20 text-trade-emerald' : 'bg-trade-crimson/20 text-trade-crimson'
              }`}
            >
              {trade.direction}
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate mt-1 uppercase">
            {trade.assetClass} • {trade.session}
          </span>
        </div>

        {/* Card 2: Normalized R Yield */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Realized Yield (1R = ${trade.initialRiskDollars})
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-mono font-bold text-2xl tabular-nums ${
                isWin ? 'text-trade-emerald' : 'text-trade-crimson'
              }`}
            >
              {trade.realizedR >= 0 ? '+' : ''}{trade.realizedR.toFixed(2)}R
            </span>
          </div>
          <span className="text-[11px] font-mono text-obsidian-slate">
            Net P&L: <strong className={isWin ? 'text-trade-emerald' : 'text-trade-crimson'}>
              {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>

        {/* Card 3: Planned R:R vs Slippage */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Planned R:R / Slippage
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono font-bold text-xl text-white">1 : {trade.plannedRR.toFixed(2)}</span>
          </div>
          <span className="text-[11px] font-mono text-obsidian-slate">
            Slippage: <span className={trade.slippageOffset > 0 ? 'text-trade-amber' : 'text-trade-emerald'}>
              {trade.slippageOffset > 0 ? `+${trade.slippageOffset}` : `${trade.slippageOffset}`} pts
            </span>
          </span>
        </div>

        {/* Card 4: Fills (Entry / Exit / Stop) */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Fill Telemetry
          </span>
          <div className="text-xs font-mono space-y-0.5 mt-1">
            <div className="flex justify-between">
              <span className="text-obsidian-slate">Entry:</span>
              <span className="text-white font-semibold">{trade.executedEntry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-obsidian-slate">Exit:</span>
              <span className="text-white font-semibold">{trade.executedExit}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Size: {trade.positionSize} units
          </span>
        </div>

        {/* Card 5: Rule Compliance Status */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Discipline Audit
          </span>
          <div className="flex items-center gap-2 mt-1">
            {trade.isFullyCompliant ? (
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-trade-emerald bg-trade-emerald/15 border border-trade-emerald/30 px-2 py-1 rounded-lg">
                <ShieldCheck className="w-4 h-4" /> 100% COMPLIANT
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-trade-crimson bg-trade-crimson/15 border border-trade-crimson/30 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-4 h-4" /> RULE VIOLATION
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            {trade.ruleResponses.filter((r) => r.passed).length} / {trade.ruleResponses.length} Rules Passed
          </span>
        </div>

        {/* Card 6: Neuro-State Reflection */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Neuro-Mindset State
          </span>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${neuroInfo.color} ${neuroInfo.bg} ${neuroInfo.border}`}
            >
              <Brain className="w-3.5 h-3.5" />
              {neuroInfo.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            {trade.executionTimeframe} trigger on {trade.anchorTimeframe} anchor
          </span>
        </div>
      </div>

      {/* Visual Trade Canvas (Dual-Image Comparison Slider) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-sans font-semibold text-white">
            <Layers className="w-4 h-4 text-trade-emerald" />
            <span>Visual Trade Canvas — Pre-Trade Thesis vs Post-Trade Outcome</span>
          </div>
        </div>

        <DualImageCanvas
          preChartUrl={trade.preChartUrl}
          postChartUrl={trade.postChartUrl}
          onUpdateChart={onUpdateChart}
          ticker={trade.instrument}
          setupName={trade.setupName}
        />
      </section>

      {/* Middle Section: Rule Adherence Checklist & 3-Line Structured Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Point Binary Compliance Audit Checklist */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-highlight pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-trade-emerald" />
              <h3 className="font-sans font-semibold text-white text-base">
                Execution Rule Adherence Audit
              </h3>
            </div>
            <span className="text-xs font-mono text-obsidian-slate">
              Click node to toggle pass/fail
            </span>
          </div>

          <div className="space-y-2.5">
            {trade.ruleResponses.map((rule) => (
              <div
                key={rule.ruleId}
                onClick={() => handleToggleRule(rule.ruleId)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  rule.passed
                    ? 'bg-obsidian-base/80 border-obsidian-highlight hover:border-trade-emerald/50'
                    : 'bg-trade-crimson/10 border-trade-crimson/40 hover:border-trade-crimson'
                }`}
              >
                <span className="text-xs font-mono text-slate-200">{rule.ruleText}</span>
                <div className="shrink-0 ml-3">
                  {rule.passed ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-trade-emerald font-semibold bg-trade-emerald/10 px-2 py-0.5 rounded border border-trade-emerald/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-trade-crimson font-semibold bg-trade-crimson/10 px-2 py-0.5 rounded border border-trade-crimson/30">
                      <XCircle className="w-3.5 h-3.5" /> BREACHED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Line Post-Mortem Narrative Autopsy */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-obsidian-highlight pb-3">
            <FileText className="w-5 h-5 text-trade-cyan" />
            <h3 className="font-sans font-semibold text-white text-base">
              3-Line Empirical Case Study Autopsy
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Act I Thesis Notes */}
            <div className="bg-obsidian-base p-3 rounded-lg border border-obsidian-highlight space-y-1">
              <span className="text-[10px] uppercase text-obsidian-slate font-bold">
                Act I — Structural Thesis & Setup Catalyst
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {trade.thesisNotes || 'No pre-trade notes logged.'}
              </p>
            </div>

            {/* Line 1: What Worked */}
            <div className="bg-obsidian-base p-3 rounded-lg border border-trade-emerald/25 space-y-1">
              <span className="text-[10px] uppercase text-trade-emerald font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-trade-emerald" />
                1. What Worked (Execution Positive)
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {trade.narrativeWorked || 'Trade adhered to structural expectations.'}
              </p>
            </div>

            {/* Line 2: What Failed */}
            <div className="bg-obsidian-base p-3 rounded-lg border border-trade-crimson/25 space-y-1">
              <span className="text-[10px] uppercase text-trade-crimson font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-trade-crimson" />
                2. What Failed (Execution Drag & Friction)
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {trade.narrativeFailed || 'No friction reported on execution.'}
              </p>
            </div>

            {/* Line 3: The Lesson */}
            <div className="bg-obsidian-base p-3 rounded-lg border border-trade-amber/25 space-y-1">
              <span className="text-[10px] uppercase text-trade-amber font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-trade-amber" />
                3. The Actionable Rule Takeaway
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {trade.narrativeLesson || 'Replicate technical discipline in subsequent sessions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Mistake Attribution & Leak Diagnostic Engine */}
      <MistakeDiagnosticEngine
        initialRiskDollars={trade.initialRiskDollars}
        plannedTargetR={trade.plannedRR}
        realizedR={trade.realizedR}
        activeMistakes={trade.mistakes}
        onChange={handleMistakesChange}
        isEditable={true}
      />
    </div>
  );
};
