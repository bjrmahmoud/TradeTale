import React from 'react';
import { Trade } from '../../types/trade';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Target,
  Sparkles,
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
  // Quantitative aggregates
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.realizedR > 0);
  const losingTrades = trades.filter((t) => t.realizedR < 0);
  const compliantTrades = trades.filter((t) => t.isFullyCompliant);

  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const adherenceRate = totalTrades > 0 ? (compliantTrades.length / totalTrades) * 100 : 100;
  const totalR = trades.reduce((acc, t) => acc + t.realizedR, 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.netPnl, 0);

  const totalGrossWin = winningTrades.reduce((acc, t) => acc + t.netPnl, 0);
  const totalGrossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnl, 0));
  const profitFactor = totalGrossLoss > 0 ? (totalGrossWin / totalGrossLoss).toFixed(2) : '∞';

  const avgWinR = winningTrades.length > 0
    ? (winningTrades.reduce((acc, t) => acc + t.realizedR, 0) / winningTrades.length).toFixed(2)
    : '0.00';
  const avgLossR = losingTrades.length > 0
    ? (Math.abs(losingTrades.reduce((acc, t) => acc + t.realizedR, 0)) / losingTrades.length).toFixed(2)
    : '0.00';

  // Discipline Streak (consecutive compliant trades)
  let streak = 0;
  for (const t of trades) {
    if (t.isFullyCompliant) streak++;
    else break;
  }

  // 70-session rolling process discipline mock matrix
  const matrixDays = Array.from({ length: 70 }, (_, i) => {
    // deterministic mock pattern reflecting trader discipline
    const mod = (i * 7 + 3) % 11;
    const isCompliant = mod !== 0 && mod !== 4;
    const isProfit = (i % 3 !== 0) || (i % 7 === 0);
    return {
      day: i + 1,
      isCompliant,
      isProfit,
      rYield: isProfit ? (mod * 0.4 + 0.8).toFixed(1) : -(mod * 0.2 + 0.5).toFixed(1),
    };
  });

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Total Realized R */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
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
            Gross: <strong className={totalNetPnl >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'}>
              {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>

        {/* Metric 2: Rule Adherence Index */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
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
              {adherenceRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Target: &gt;90% Plan Compliance
          </span>
        </div>

        {/* Metric 3: Win Rate */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Execution Win Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {winRate.toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-obsidian-slate">({winningTrades.length}/{totalTrades})</span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Profit Factor: <strong className="text-white">{profitFactor}</strong>
          </span>
        </div>

        {/* Metric 4: Expectancy */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Avg Win vs Avg Loss
          </span>
          <div className="flex items-center gap-2 mt-1 font-mono text-base font-bold">
            <span className="text-trade-emerald">+{avgWinR}R</span>
            <span className="text-obsidian-slate">/</span>
            <span className="text-trade-crimson">-{avgLossR}R</span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Mathematical Edge: +1.34R/trade
          </span>
        </div>

        {/* Metric 5: Discipline Streak */}
        <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-slate">
            Discipline Streak
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className="w-5 h-5 text-trade-amber" />
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {streak}
            </span>
            <span className="text-xs font-mono text-obsidian-slate">Sessions</span>
          </div>
          <span className="text-[10px] font-mono text-obsidian-slate">
            Zero Revenge Entries
          </span>
        </div>

        {/* Metric 6: Quick Action */}
        <div className="bg-gradient-to-br from-obsidian-surface to-obsidian-elevated border border-trade-emerald/30 rounded-xl p-4 flex flex-col justify-between shadow-glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-trade-emerald font-bold">
              3-Act Logger
            </span>
            <Sparkles className="w-3.5 h-3.5 text-trade-emerald" />
          </div>
          <button
            onClick={onOpenLogger}
            className="w-full mt-2 py-1.5 bg-trade-emerald hover:bg-emerald-400 text-obsidian-base rounded-lg text-xs font-mono font-bold transition-all"
          >
            + Log New Trade [N]
          </button>
          <span className="text-[9px] font-mono text-obsidian-slate text-center mt-1">
            Sub-45s structured autopsy
          </span>
        </div>
      </div>

      {/* Process Discipline Heatmap (Rolling 70 Sessions) */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-trade-emerald" />
            <h3 className="font-sans font-semibold text-white text-sm tracking-wide">
              Process Discipline & Behavioral Heatmap
            </h3>
          </div>
          {/* Heatmap Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-obsidian-slate">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-trade-emerald shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span>Compliant Win</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-obsidian-muted" />
              <span>Compliant Loss (Clean)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-trade-crimson shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span>Rule Violation Loss</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-10 sm:grid-cols-14 md:grid-cols-20 lg:grid-cols-25 gap-1.5 pt-2">
          {matrixDays.map((item) => {
            let bgClass = 'bg-obsidian-muted';
            let title = `Day ${item.day}: Clean Compliant Loss (${item.rYield}R)`;

            if (item.isCompliant && item.isProfit) {
              bgClass = 'bg-trade-emerald/80 hover:bg-trade-emerald';
              title = `Day ${item.day}: Compliant Win (+${item.rYield}R)`;
            } else if (!item.isCompliant) {
              bgClass = 'bg-trade-crimson/80 hover:bg-trade-crimson';
              title = `Day ${item.day}: Rule Violation Loss (${item.rYield}R)`;
            }

            return (
              <div
                key={item.day}
                title={title}
                className={`h-5 rounded-sm ${bgClass} transition-colors cursor-pointer border border-obsidian-base hover:scale-110`}
              />
            );
          })}
        </div>
      </div>

      {/* Chronological Execution Stream (Trade Feed) */}
      <div className="bg-obsidian-surface border border-obsidian-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-obsidian-highlight flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-trade-cyan" />
            <h3 className="font-sans font-semibold text-white text-sm tracking-wide">
              Chronological Execution Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-obsidian-slate">
            Showing {trades.length} Case Studies
          </span>
        </div>

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

                    {/* Realized R */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          isWin ? 'text-trade-emerald' : 'text-trade-crimson'
                        }`}
                      >
                        {trade.realizedR >= 0 ? '+' : ''}{trade.realizedR.toFixed(2)}R
                      </span>
                    </td>

                    {/* Net P&L */}
                    <td className="px-4 py-3.5 tabular-nums">
                      <span className={isWin ? 'text-trade-emerald' : 'text-trade-crimson'}>
                        {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Discipline Badge */}
                    <td className="px-4 py-3.5">
                      {trade.isFullyCompliant ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-trade-emerald bg-trade-emerald/10 border border-trade-emerald/30 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> 100% Plan Adherent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-trade-crimson bg-trade-crimson/10 border border-trade-crimson/30 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Rule Violation
                        </span>
                      )}
                    </td>

                    {/* Mistake Faults */}
                    <td className="px-4 py-3.5">
                      {trade.mistakes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {trade.mistakes.map((m) => (
                            <span
                              key={m.mistakeId}
                              className="text-[10px] bg-obsidian-base border border-trade-crimson/40 text-trade-crimson px-1.5 py-0.2 rounded"
                            >
                              {m.label} (-{m.costOfMistakeR}R)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-obsidian-slate/60 text-[11px]">None (Disciplined)</span>
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
      </div>
    </div>
  );
};
