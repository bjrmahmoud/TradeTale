import React from 'react';
import { Trade } from '../../types/trade';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  ExternalLink,
  Sparkles,
  Plus,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface DailyPulseDashboardProps {
  trades: Trade[];
  onSelectTrade: (id: string) => void;
  onOpenLogger: () => void;
}

export const DailyPulseDashboard: React.FC<DailyPulseDashboardProps> = ({
  trades,
  onSelectTrade,
  onOpenLogger,
}) => {
  // 1. Dynamic Metric Calculations directly from trade records
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.realizedR > 0);
  const losingTrades = trades.filter((t) => t.realizedR < 0);
  const breakEvenTrades = trades.filter((t) => t.realizedR === 0);
  const compliantTrades = trades.filter((t) => t.isFullyCompliant);

  // Cumulative Running R and Dollar Balance
  const totalR = Number(trades.reduce((acc, t) => acc + t.realizedR, 0).toFixed(2));
  const totalNetPnl = Number(trades.reduce((acc, t) => acc + t.netPnl, 0).toFixed(2));

  // Rule Adherence Index (RAI)
  const adherenceRate = totalTrades > 0 ? Number(((compliantTrades.length / totalTrades) * 100).toFixed(1)) : 100;

  // Win Rate %
  const winRate = totalTrades > 0 ? Number(((winningTrades.length / totalTrades) * 100).toFixed(1)) : 0;

  // Gross Wins and Losses for Profit Factor
  const totalGrossWin = winningTrades.reduce((acc, t) => acc + t.netPnl, 0);
  const totalGrossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnl, 0));
  const profitFactor = totalGrossLoss > 0 ? (totalGrossWin / totalGrossLoss).toFixed(2) : totalGrossWin > 0 ? '∞' : '0.00';

  // Average Win R and Loss R
  const avgWinR = winningTrades.length > 0
    ? (winningTrades.reduce((acc, t) => acc + t.realizedR, 0) / winningTrades.length).toFixed(2)
    : '0.00';
  const avgLossR = losingTrades.length > 0
    ? (Math.abs(losingTrades.reduce((acc, t) => acc + t.realizedR, 0)) / losingTrades.length).toFixed(2)
    : '0.00';

  // Mathematical Edge Expectancy: E = (Win% * AvgWinR) - (Loss% * AvgLossR)
  const winFraction = totalTrades > 0 ? winningTrades.length / totalTrades : 0;
  const lossFraction = totalTrades > 0 ? losingTrades.length / totalTrades : 0;
  const mathEdge = Number(
    (winFraction * parseFloat(avgWinR) - lossFraction * parseFloat(avgLossR)).toFixed(2)
  );

  // Discipline Streak: Count consecutive compliant trades starting from the most recent trade
  let streak = 0;
  for (const t of trades) {
    if (t.isFullyCompliant) {
      streak++;
    } else {
      break;
    }
  }

  // 2. Dynamic Process Discipline Heatmap derived directly from actual logged trades
  // Sort trades chronologically (oldest to newest, left-to-right)
  const chronologicalTrades = [...trades].sort(
    (a, b) => new Date(a.entryTimestamp).getTime() - new Date(b.entryTimestamp).getTime()
  );

  const compliantWinsCount = trades.filter((t) => t.isFullyCompliant && t.realizedR > 0).length;
  const compliantLossesCount = trades.filter((t) => t.isFullyCompliant && t.realizedR <= 0).length;
  const violationCount = trades.filter((t) => !t.isFullyCompliant).length;

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Top Metric Strip — 100% Dynamically Computed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Normalized Edge ($R & Balance) */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Normalized Edge
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-mono font-bold text-2xl tabular-nums ${
                totalR >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'
              }`}
            >
              {totalR >= 0 ? '+' : ''}{totalR.toFixed(2)}R
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Balance:{' '}
            <strong className={totalNetPnl >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'}>
              {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>

        {/* Metric 2: Rule Adherence Index (RAI) */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Rule Adherence Index (RAI)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-mono font-bold text-2xl tabular-nums ${
                adherenceRate >= 90
                  ? 'text-trade-emerald'
                  : adherenceRate >= 75
                  ? 'text-trade-amber'
                  : 'text-trade-crimson'
              }`}
            >
              {adherenceRate}%
            </span>
            <span className="text-[10px] font-mono text-obsidian-slate">
              ({compliantTrades.length}/{totalTrades})
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Target: &gt;90% Process Compliance
          </span>
        </div>

        {/* Metric 3: Win Rate & Profit Factor */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Execution Win Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {winRate}%
            </span>
            <span className="text-xs font-mono text-obsidian-slate">
              ({winningTrades.length}W - {losingTrades.length}L{breakEvenTrades.length > 0 ? ` - ${breakEvenTrades.length}BE` : ''})
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Profit Factor: <strong className="text-white">{profitFactor}</strong>
          </span>
        </div>

        {/* Metric 4: Mathematical Edge */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Mathematical Expectancy
          </span>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono text-xl font-bold">
            <span
              className={mathEdge >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'}
            >
              {mathEdge >= 0 ? '+' : ''}{mathEdge}R
            </span>
            <span className="text-[10px] text-obsidian-slate font-normal">/ trade</span>
          </div>
          <div className="text-[10px] font-mono text-obsidian-slate flex items-center gap-1.5">
            <span className="text-trade-emerald">+{avgWinR}R</span>
            <span>/</span>
            <span className="text-trade-crimson">-{avgLossR}R</span>
          </div>
        </div>

        {/* Metric 5: Discipline Streak */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Discipline Streak
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-trade-amber' : 'text-obsidian-slate'}`} />
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {streak}
            </span>
            <span className="text-xs font-mono text-obsidian-slate">Trades</span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            {streak > 0 ? 'Zero Rule Violations' : 'Reset on Rule Fault'}
          </span>
        </div>

        {/* Metric 6: Quick Action Button */}
        <div className="bg-gradient-to-br from-obsidian-surface to-obsidian-elevated border border-trade-emerald/30 rounded-xl p-4 flex flex-col justify-between shadow-glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-trade-emerald font-bold">
              Fast Trade Logger
            </span>
            <Sparkles className="w-3.5 h-3.5 text-trade-emerald" />
          </div>
          <button
            onClick={onOpenLogger}
            className="w-full mt-2 py-1.5 bg-trade-emerald hover:bg-emerald-400 text-obsidian-base rounded-lg text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Trade [N]</span>
          </button>
          <span className="text-[9px] font-mono text-obsidian-slate text-center mt-1">
            Visual 2-step autopsy
          </span>
        </div>
      </div>

      {/* Dynamic Process Discipline & Behavioral Heatmap */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian-highlight pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-trade-emerald" />
            <h3 className="font-sans font-semibold text-white text-sm tracking-wide">
              Process Discipline & Behavioral Heatmap
            </h3>
            <span className="text-xs font-mono text-obsidian-slate bg-obsidian-base px-2 py-0.5 rounded border border-obsidian-highlight">
              {totalTrades} Execution Units Logged
            </span>
          </div>

          {/* Dynamic Heatmap Legend with Live Counters */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-obsidian-slate">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-trade-emerald shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span>Compliant Win ({compliantWinsCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
              <span>Compliant Loss ({compliantLossesCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-trade-crimson shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              <span>Rule Violation ({violationCount})</span>
            </div>
          </div>
        </div>

        {/* Dynamic Matrix Grid rendered directly from logged trades */}
        {chronologicalTrades.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 pt-1">
              {chronologicalTrades.map((trade, idx) => {
                const isCompliant = trade.isFullyCompliant;
                const isWin = trade.realizedR > 0;

                let cellBg = 'bg-slate-600';
                let cellBorder = 'border-slate-500/30';
                let label = 'Compliant Loss';

                if (isCompliant && isWin) {
                  cellBg = 'bg-trade-emerald hover:brightness-110 shadow-[0_0_8px_rgba(16,185,129,0.35)]';
                  cellBorder = 'border-trade-emerald/50';
                  label = 'Compliant Win';
                } else if (!isCompliant) {
                  cellBg = 'bg-trade-crimson hover:brightness-110 shadow-[0_0_8px_rgba(239,68,68,0.35)]';
                  cellBorder = 'border-trade-crimson/50';
                  label = 'Rule Violation Fault';
                }

                const dateStr = new Date(trade.entryTimestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={trade.id}
                    onClick={() => onSelectTrade(trade.id)}
                    title={`#${idx + 1} | ${trade.instrument} (${trade.direction.toUpperCase()}) - ${dateStr}\n${label}: ${trade.realizedR >= 0 ? '+' : ''}${trade.realizedR}R ($${trade.netPnl})\nSetup: ${trade.setupName}\nClick to inspect autopsy`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md ${cellBg} border ${cellBorder} flex items-center justify-center cursor-pointer transition-transform hover:scale-115 text-[10px] font-mono font-bold text-obsidian-base`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] font-mono text-obsidian-slate pt-1">
              Timeline: Chronological sequence of executions (left to right). Click any cell to open its autopsy.
            </p>
          </div>
        ) : (
          /* Empty State Placeholder */
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 bg-obsidian-base/50 rounded-lg border border-dashed border-obsidian-border">
            <Calendar className="w-8 h-8 text-obsidian-slate opacity-40" />
            <p className="text-xs font-mono text-slate-300">
              No executions recorded in this session yet.
            </p>
            <p className="text-[11px] font-mono text-obsidian-slate max-w-md">
              Log your first trade using the 2-step logger or press <kbd className="bg-obsidian-surface px-1.5 py-0.5 rounded text-white border border-obsidian-highlight">N</kbd> to activate the discipline matrix.
            </p>
          </div>
        )}
      </div>

      {/* Chronological Execution Stream (Directly from Trade Collection) */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-obsidian-highlight flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-trade-cyan" />
            <h3 className="font-sans font-semibold text-white text-sm tracking-wide">
              Chronological Execution Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-obsidian-slate">
            {totalTrades} Empirical Case Studies Recorded
          </span>
        </div>

        {totalTrades > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-obsidian-base border-b border-obsidian-border text-obsidian-slate uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ticker / Side</th>
                  <th className="px-4 py-3">Playbook Setup</th>
                  <th className="px-4 py-3">Planned R:R</th>
                  <th className="px-4 py-3">Realized Yield</th>
                  <th className="px-4 py-3">Net P&L</th>
                  <th className="px-4 py-3">Rule Discipline</th>
                  <th className="px-4 py-3">Mistake Faults</th>
                  <th className="px-4 py-3 text-right">Autopsy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-highlight/50">
                {trades.map((trade) => {
                  const isLong = trade.direction === 'long';
                  const isWin = trade.realizedR > 0;

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => onSelectTrade(trade.id)}
                      className="hover:bg-obsidian-elevated/80 transition-colors cursor-pointer group"
                    >
                      {/* Ticker & Side */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{trade.instrument}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isLong
                                ? 'bg-trade-emerald/20 text-trade-emerald'
                                : 'bg-trade-crimson/20 text-trade-crimson'
                            }`}
                          >
                            {trade.direction}
                          </span>
                        </div>
                        <span className="text-[10px] text-obsidian-slate uppercase">
                          {trade.session} • {trade.executionTimeframe}
                        </span>
                      </td>

                      {/* Setup Name */}
                      <td className="px-4 py-3.5 font-sans text-slate-300 font-medium">
                        {trade.setupName}
                      </td>

                      {/* Planned R:R */}
                      <td className="px-4 py-3.5 text-obsidian-slate">
                        1 : {trade.plannedRR.toFixed(2)}
                      </td>

                      {/* Realized Yield in R */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            isWin ? 'text-trade-emerald' : 'text-trade-crimson'
                          }`}
                        >
                          {trade.realizedR >= 0 ? '+' : ''}{trade.realizedR.toFixed(2)}R
                        </span>
                      </td>

                      {/* Net P&L in fiat */}
                      <td className="px-4 py-3.5 tabular-nums">
                        <span className={isWin ? 'text-trade-emerald' : 'text-trade-crimson'}>
                          {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Rule Discipline Status */}
                      <td className="px-4 py-3.5">
                        {trade.isFullyCompliant ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-trade-emerald bg-trade-emerald/10 border border-trade-emerald/30 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" /> 100% Compliant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-trade-crimson bg-trade-crimson/10 border border-trade-crimson/30 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Rule Fault
                          </span>
                        )}
                      </td>

                      {/* Mistake Faults */}
                      <td className="px-4 py-3.5">
                        {trade.mistakes && trade.mistakes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {trade.mistakes.map((m) => (
                              <span
                                key={m.mistakeId}
                                className="text-[10px] bg-obsidian-base border border-trade-crimson/40 text-trade-crimson px-1.5 py-0.5 rounded"
                              >
                                {m.label} (-{m.costOfMistakeR}R)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-obsidian-slate/60 text-[11px]">Disciplined (Clean)</span>
                        )}
                      </td>

                      {/* Drill-down button */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrade(trade.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-trade-emerald group-hover:underline"
                        >
                          Inspect <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <BarChart3 className="w-10 h-10 text-obsidian-slate mx-auto opacity-40" />
            <h4 className="font-sans font-bold text-white text-base">
              No Execution Records Found
            </h4>
            <p className="text-xs font-mono text-obsidian-slate max-w-sm mx-auto">
              Your chronological trade feed is ready. Submit a trade autopsy to dynamically populate your edge metrics and leak diagnostics.
            </p>
            <button
              onClick={onOpenLogger}
              className="mt-2 px-4 py-2 bg-trade-emerald hover:bg-emerald-400 text-obsidian-base font-mono font-bold text-xs rounded-lg transition-all shadow-glow-emerald"
            >
              + Log First Trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
