import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Brain,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Trade,
  AssetClass,
  TradeDirection,
  SessionType,
  NeuroState,
  TradeMistake,
  RuleResponse,
} from '../../types/trade';
import { PLAYBOOK_SETUPS, UNIVERSAL_RULES, SYSTEM_MISTAKES } from '../../lib/constants';
import { generatePreTradeChartSvg, generatePostTradeChartSvg } from '../../lib/chartGenerator';

interface ThreeActTradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
}

export const ThreeActTradeLoggerModal: React.FC<ThreeActTradeLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
}) => {
  const [activeAct, setActiveAct] = useState<1 | 2 | 3>(1);

  // Form State — Act I
  const [instrument, setInstrument] = useState<string>('NQ');
  const [assetClass, setAssetClass] = useState<AssetClass>('futures');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [session, setSession] = useState<SessionType>('ny_am');
  const [anchorTimeframe, setAnchorTimeframe] = useState<string>('1H');
  const [executionTimeframe, setExecutionTimeframe] = useState<string>('2m');
  const [setupName, setSetupName] = useState<string>(PLAYBOOK_SETUPS[0].name);
  const [plannedEntry, setPlannedEntry] = useState<number>(18350.0);
  const [plannedStop, setPlannedStop] = useState<number>(18320.0);
  const [plannedTarget, setPlannedTarget] = useState<number>(18440.0);
  const [thesisNotes, setThesisNotes] = useState<string>('');
  const [preChartUrl, setPreChartUrl] = useState<string>('');

  // Form State — Act II
  const [executedEntry, setExecutedEntry] = useState<number>(18351.0);
  const [executedStop, setExecutedStop] = useState<number>(18320.0);
  const [positionSize, setPositionSize] = useState<number>(2);
  const [neuroState, setNeuroState] = useState<NeuroState>('calm_centered');

  // Form State — Act III
  const [executedExit, setExecutedExit] = useState<number>(18438.0);
  const [commissionFees, setCommissionFees] = useState<number>(9.2);
  const [postChartUrl, setPostChartUrl] = useState<string>('');
  const [narrativeWorked, setNarrativeWorked] = useState<string>('');
  const [narrativeFailed, setNarrativeFailed] = useState<string>('');
  const [narrativeLesson, setNarrativeLesson] = useState<string>('');

  // Rules & Mistakes
  const [ruleResponses, setRuleResponses] = useState<RuleResponse[]>(
    UNIVERSAL_RULES.map((r) => ({ ruleId: r.id, ruleText: r.ruleText, passed: true }))
  );
  const [mistakes, setMistakes] = useState<TradeMistake[]>([]);

  // Calculate Planned R:R
  const plannedRR = useMemo(() => {
    const risk = Math.abs(plannedEntry - plannedStop);
    const reward = Math.abs(plannedTarget - plannedEntry);
    if (risk === 0) return 1;
    return Number((reward / risk).toFixed(2));
  }, [plannedEntry, plannedStop, plannedTarget]);

  // Calculate Slippage
  const slippage = Number((executedEntry - plannedEntry).toFixed(2));

  // Calculate Initial Risk in Dollars (1R denominator)
  // For futures NQ, 1 point = $20 per contract. For general purposes: point risk * multiplier * size
  const pointMultiplier = assetClass === 'futures' ? (instrument.toUpperCase().includes('NQ') ? 20 : 50) : 1;
  const stopDistance = Math.abs(executedEntry - executedStop);
  const initialRiskDollars = Number((stopDistance * pointMultiplier * positionSize).toFixed(2)) || 500;

  // Calculate Net P&L and Realized R
  const priceMove = direction === 'long' ? executedExit - executedEntry : executedEntry - executedExit;
  const grossPnl = Number((priceMove * pointMultiplier * positionSize).toFixed(2));
  const netPnl = Number((grossPnl - commissionFees).toFixed(2));
  const realizedR = initialRiskDollars > 0 ? Number((netPnl / initialRiskDollars).toFixed(2)) : 0;

  // Generate default charts if empty
  useEffect(() => {
    if (!preChartUrl) {
      setPreChartUrl(
        generatePreTradeChartSvg({
          ticker: instrument,
          timeframe: executionTimeframe,
          direction,
          entry: plannedEntry,
          stop: plannedStop,
          target: plannedTarget,
          setupName,
        })
      );
    }
  }, [instrument, executionTimeframe, direction, plannedEntry, plannedStop, plannedTarget, setupName, preChartUrl]);

  useEffect(() => {
    if (!postChartUrl) {
      setPostChartUrl(
        generatePostTradeChartSvg({
          ticker: instrument,
          timeframe: executionTimeframe,
          direction,
          entry: executedEntry,
          stop: executedStop,
          target: plannedTarget,
          exitPrice: executedExit,
          realizedR,
          outcomeType: realizedR >= plannedRR ? 'target_hit' : realizedR <= -1 ? 'stopped_out' : 'early_close',
        })
      );
    }
  }, [instrument, executionTimeframe, direction, executedEntry, executedStop, plannedTarget, executedExit, realizedR, plannedRR, postChartUrl]);

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to submit, Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const toggleRule = (ruleId: string) => {
    setRuleResponses((prev) =>
      prev.map((r) => (r.ruleId === ruleId ? { ...r, passed: !r.passed } : r))
    );
  };

  const toggleMistakeTag = (mistakeId: string) => {
    const exists = mistakes.find((m) => m.mistakeId === mistakeId);
    if (exists) {
      setMistakes(mistakes.filter((m) => m.mistakeId !== mistakeId));
    } else {
      const def = SYSTEM_MISTAKES.find((m) => m.id === mistakeId);
      if (!def) return;
      const rLeak = realizedR < plannedRR ? Math.max(0.5, Number((plannedRR - realizedR).toFixed(2))) : 0.5;
      setMistakes([
        ...mistakes,
        {
          mistakeId: def.id,
          code: def.code,
          label: def.label,
          category: def.category,
          severity: 'moderate',
          costOfMistakeR: rLeak,
          costOfMistakeFiat: Number((rLeak * initialRiskDollars).toFixed(2)),
          triggerEmotion: '',
          ruleTakeaway: '',
        },
      ]);
    }
  };

  const handleSubmit = () => {
    const isCompliant = ruleResponses.every((r) => r.passed) && mistakes.length === 0;

    const newTrade: Trade = {
      id: `trade-${Date.now().toString().slice(-4)}`,
      accountName: 'Apex 50k Funded #1402',
      setupName,
      instrument: instrument.toUpperCase(),
      assetClass,
      direction,
      session,
      anchorTimeframe,
      executionTimeframe,
      plannedEntry,
      plannedStop,
      plannedTarget,
      plannedRR,
      preChartUrl,
      thesisNotes,
      executedEntry,
      executedStop,
      positionSize,
      entryTimestamp: new Date().toISOString(),
      neuroState,
      slippageOffset: slippage,
      executedExit,
      exitTimestamp: new Date().toISOString(),
      grossPnl,
      commissionFees,
      netPnl,
      postChartUrl,
      narrativeWorked,
      narrativeFailed,
      narrativeLesson,
      initialRiskDollars,
      realizedR,
      isFullyCompliant: isCompliant,
      ruleResponses,
      mistakes,
      createdAt: new Date().toISOString(),
    };

    onSaveTrade(newTrade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-obsidian-surface border border-obsidian-highlight rounded-2xl w-full max-w-4xl shadow-command overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header & Three-Act Tab Stepper */}
        <div className="border-b border-obsidian-border bg-obsidian-base p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-trade-emerald/15 border border-trade-emerald/30 text-trade-emerald">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-white text-base">
                Three-Act Narrative Trade Logger
              </h2>
              <p className="text-[11px] font-mono text-obsidian-slate">
                Press <kbd className="text-white bg-obsidian-surface px-1.5 py-0.5 rounded border border-obsidian-highlight">⌘+Enter</kbd> to save at any time
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center bg-obsidian-surface p-1 rounded-lg border border-obsidian-highlight">
            <button
              onClick={() => setActiveAct(1)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeAct === 1
                  ? 'bg-trade-emerald text-obsidian-base'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Act I: Thesis
            </button>
            <button
              onClick={() => setActiveAct(2)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeAct === 2
                  ? 'bg-trade-emerald text-obsidian-base'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Act II: Execution
            </button>
            <button
              onClick={() => setActiveAct(3)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeAct === 3
                  ? 'bg-trade-emerald text-obsidian-base'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Act III: Autopsy
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-obsidian-slate hover:text-white p-2 rounded-lg hover:bg-obsidian-highlight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ACT I: THE THESIS */}
          {activeAct === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Instrument */}
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Instrument Ticker
                  </label>
                  <input
                    type="text"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-trade-emerald outline-none"
                    placeholder="e.g. NQ, ES, NVDA"
                  />
                </div>

                {/* Direction */}
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Trade Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDirection('long')}
                      className={`py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                        direction === 'long'
                          ? 'bg-trade-emerald text-obsidian-base shadow-glow-emerald'
                          : 'bg-obsidian-base text-obsidian-slate border border-obsidian-border'
                      }`}
                    >
                      LONG ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('short')}
                      className={`py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                        direction === 'short'
                          ? 'bg-trade-crimson text-white shadow-glow-crimson'
                          : 'bg-obsidian-base text-obsidian-slate border border-obsidian-border'
                      }`}
                    >
                      SHORT ▼
                    </button>
                  </div>
                </div>

                {/* Strategy Model Setup */}
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Playbook Strategy Setup
                  </label>
                  <select
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-trade-emerald outline-none"
                  >
                    {PLAYBOOK_SETUPS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} (Win: {s.winRate}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timeframes & Session */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Market Session
                  </label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value as SessionType)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                  >
                    <option value="ny_am">New York AM (09:30-11:30)</option>
                    <option value="london">London Open</option>
                    <option value="ny_lunch">NY Lunch</option>
                    <option value="ny_pm">NY Afternoon Power Hour</option>
                    <option value="asia">Asian Session</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Anchor Timeframe
                  </label>
                  <input
                    type="text"
                    value={anchorTimeframe}
                    onChange={(e) => setAnchorTimeframe(e.target.value)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                    placeholder="e.g. 1H, 4H, 1D"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Execution Trigger Timeframe
                  </label>
                  <input
                    type="text"
                    value={executionTimeframe}
                    onChange={(e) => setExecutionTimeframe(e.target.value)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                    placeholder="e.g. 1m, 2m, 5m"
                  />
                </div>
              </div>

              {/* Planned Levels: Entry, Stop, Target + Live R:R */}
              <div className="bg-obsidian-base border border-obsidian-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-obsidian-slate">
                    Planned Structural Levels & Invalidation
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-obsidian-slate">Planned R:R:</span>
                    <span className="text-xs font-mono font-bold text-trade-emerald bg-trade-emerald/15 px-2.5 py-0.5 rounded border border-trade-emerald/30">
                      1 : {plannedRR}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-sky-400 block mb-1">
                      Planned Entry Price
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedEntry}
                      onChange={(e) => setPlannedEntry(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-sky-500/40 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-trade-crimson block mb-1">
                      Invalidation / Stop Loss
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedStop}
                      onChange={(e) => setPlannedStop(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-trade-crimson/40 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-trade-emerald block mb-1">
                      Take-Profit Target
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedTarget}
                      onChange={(e) => setPlannedTarget(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-trade-emerald/40 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Thesis Catalyst & Notes */}
              <div>
                <label className="text-xs font-mono text-obsidian-slate block mb-1">
                  Act I Narrative Thesis & Catalyst Notes
                </label>
                <textarea
                  rows={3}
                  value={thesisNotes}
                  onChange={(e) => setThesisNotes(e.target.value)}
                  placeholder="e.g. Session low swept during 09:30 open, bullish change of character printed on 2m with heavy delta volume..."
                  className="w-full bg-obsidian-base border border-obsidian-border rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-trade-emerald"
                />
              </div>
            </div>
          )}

          {/* ACT II: LIVE EXECUTION */}
          {activeAct === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Executed Fill Price
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={executedEntry}
                    onChange={(e) => setExecutedEntry(parseFloat(e.target.value) || 0)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                  />
                  <div className="text-[11px] font-mono text-obsidian-slate mt-1">
                    Slippage:{' '}
                    <span className={slippage > 0 ? 'text-trade-amber' : 'text-trade-emerald'}>
                      {slippage > 0 ? `+${slippage}` : `${slippage}`} pts
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Actual Stop Loss Placed
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={executedStop}
                    onChange={(e) => setExecutedStop(parseFloat(e.target.value) || 0)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                  />
                  <div className="text-[11px] font-mono text-obsidian-slate mt-1">
                    Initial Risk (1R): <strong className="text-white">${initialRiskDollars}</strong>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Position Size (Contracts/Shares)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={positionSize}
                    onChange={(e) => setPositionSize(parseInt(e.target.value) || 1)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Neuro-State Selector */}
              <div>
                <label className="text-xs font-mono text-obsidian-slate block mb-2 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-trade-cyan" />
                  Trader Mindset & Neuro-State Telemetry
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'calm_centered', label: 'Calm & Centered', desc: 'Heart rate baseline, objective plan execution' },
                    { key: 'fomo_urge', label: 'FOMO Impulse', desc: 'Fear of missing expansion move' },
                    { key: 'hesitant', label: 'Hesitant / Late', desc: 'Second guessed confirmation trigger' },
                    { key: 'chasing_price', label: 'Chasing Extension', desc: 'Jumped in after large green/red bar' },
                    { key: 'revenge_tilted', label: 'Revenge / Tilted', desc: 'Urge to win back prior loss immediately' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setNeuroState(item.key as NeuroState)}
                      className={`p-3 rounded-xl border text-left font-mono transition-all ${
                        neuroState === item.key
                          ? 'bg-obsidian-highlight border-trade-emerald text-white shadow-glow-emerald'
                          : 'bg-obsidian-base border-obsidian-border text-obsidian-slate hover:border-obsidian-highlight hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-obsidian-slate mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACT III: OUTCOME, RULES & AUTOPSY */}
          {activeAct === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Exit Price & Net P&L Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Executed Exit Price
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={executedExit}
                    onChange={(e) => setExecutedExit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-obsidian-slate block mb-1">
                    Commissions & Fees ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={commissionFees}
                    onChange={(e) => setCommissionFees(parseFloat(e.target.value) || 0)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                  />
                </div>

                {/* Real-time Yield Metric */}
                <div className="bg-obsidian-base border border-obsidian-border rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-obsidian-slate uppercase">
                    Calculated Yield
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span
                      className={`font-mono text-lg font-bold ${
                        realizedR >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'
                      }`}
                    >
                      {realizedR >= 0 ? '+' : ''}{realizedR}R
                    </span>
                    <span className="text-xs font-mono text-obsidian-slate">
                      (${netPnl.toLocaleString('en-US')})
                    </span>
                  </div>
                </div>
              </div>

              {/* Binary Rule Checklist */}
              <div className="bg-obsidian-base border border-obsidian-border rounded-xl p-4 space-y-2.5">
                <span className="text-xs font-mono font-bold uppercase text-obsidian-slate block">
                  Rule Compliance Checklist (Pass / Fail)
                </span>
                <div className="space-y-2">
                  {ruleResponses.map((rule) => (
                    <div
                      key={rule.ruleId}
                      onClick={() => toggleRule(rule.ruleId)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs font-mono transition-all ${
                        rule.passed
                          ? 'bg-obsidian-surface border-trade-emerald/30 text-white'
                          : 'bg-trade-crimson/15 border-trade-crimson text-trade-crimson font-bold'
                      }`}
                    >
                      <span>{rule.ruleText}</span>
                      <span>{rule.passed ? '✓ PASSED' : '✕ BREACHED'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistake Fault Selector */}
              <div>
                <span className="text-xs font-mono font-bold uppercase text-obsidian-slate block mb-2">
                  Execution Fault Attribution (Optional)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYSTEM_MISTAKES.map((m) => {
                    const isSelected = mistakes.some((active) => active.mistakeId === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMistakeTag(m.id)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-mono transition-all ${
                          isSelected
                            ? 'bg-trade-crimson/20 border-trade-crimson text-white font-semibold'
                            : 'bg-obsidian-base border-obsidian-highlight text-obsidian-slate hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3-Line Structured Narrative Review */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-obsidian-slate block">
                  3-Line Post-Mortem Reflection
                </span>
                <input
                  type="text"
                  placeholder="1. What Worked: e.g. Respected initial stop, waited for 2m candle confirmation"
                  value={narrativeWorked}
                  onChange={(e) => setNarrativeWorked(e.target.value)}
                  className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-emerald"
                />
                <input
                  type="text"
                  placeholder="2. What Failed: e.g. 1 point slippage on market order fill"
                  value={narrativeFailed}
                  onChange={(e) => setNarrativeFailed(e.target.value)}
                  className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-crimson"
                />
                <input
                  type="text"
                  placeholder="3. The Lesson: e.g. Place resting limit orders inside 50% FVG zone"
                  value={narrativeLesson}
                  onChange={(e) => setNarrativeLesson(e.target.value)}
                  className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-amber"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-obsidian-border bg-obsidian-base p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeAct > 1 && (
              <button
                type="button"
                onClick={() => setActiveAct((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-obsidian-slate hover:text-white border border-obsidian-border"
              >
                Back
              </button>
            )}
            {activeAct < 3 && (
              <button
                type="button"
                onClick={() => setActiveAct((prev) => (prev + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-obsidian-highlight text-white hover:bg-obsidian-border"
              >
                Next Act <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-obsidian-slate hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit Trade Autopsy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
