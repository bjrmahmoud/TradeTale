import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Upload,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Brain,
  Sparkles,
  Columns,
  Layers,
  ArrowLeftRight,
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

interface StreamlinedTradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
}

export const StreamlinedTradeLoggerModal: React.FC<StreamlinedTradeLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
}) => {
  // Step 1: Visual Setup & Fills | Step 2: Annotation & Diagnostics
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Execution & Fills
  const [instrument, setInstrument] = useState<string>('NQ');
  const [assetClass, setAssetClass] = useState<AssetClass>('futures');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [session, setSession] = useState<SessionType>('ny_am');
  const [setupName, setSetupName] = useState<string>(PLAYBOOK_SETUPS[0].name);
  const [anchorTimeframe, setAnchorTimeframe] = useState<string>('1H');
  const [executionTimeframe, setExecutionTimeframe] = useState<string>('2m');

  const [plannedEntry, setPlannedEntry] = useState<number>(18350.0);
  const [plannedStop, setPlannedStop] = useState<number>(18320.0);
  const [plannedTarget, setPlannedTarget] = useState<number>(18440.0);

  const [executedEntry, setExecutedEntry] = useState<number>(18351.0);
  const [executedStop, setExecutedStop] = useState<number>(18320.0);
  const [executedExit, setExecutedExit] = useState<number>(18438.0);
  const [positionSize, setPositionSize] = useState<number>(2);
  const [commissionFees, setCommissionFees] = useState<number>(9.2);

  // Charts & Canvas
  const [preChartUrl, setPreChartUrl] = useState<string>('');
  const [postChartUrl, setPostChartUrl] = useState<string>('');
  const [activePasteSlot, setActivePasteSlot] = useState<'pre' | 'post'>('pre');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'split'>('slider');

  // Step 2: Annotation, Diagnostics & Autopsy
  const [ruleResponses, setRuleResponses] = useState<RuleResponse[]>(
    UNIVERSAL_RULES.map((r) => ({ ruleId: r.id, ruleText: r.ruleText, passed: true }))
  );
  const [mistakes, setMistakes] = useState<TradeMistake[]>([]);
  const [neuroState, setNeuroState] = useState<NeuroState>('calm_centered');
  const [thesisNotes, setThesisNotes] = useState<string>('');
  const [narrativeWorked, setNarrativeWorked] = useState<string>('');
  const [narrativeFailed, setNarrativeFailed] = useState<string>('');
  const [narrativeLesson, setNarrativeLesson] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mathematical Planned R:R
  const plannedRR = useMemo(() => {
    const risk = Math.abs(plannedEntry - plannedStop);
    const reward = Math.abs(plannedTarget - plannedEntry);
    if (risk === 0) return 1;
    return Number((reward / risk).toFixed(2));
  }, [plannedEntry, plannedStop, plannedTarget]);

  // Slippage
  const slippage = Number((executedEntry - plannedEntry).toFixed(2));

  // Initial Risk Dollars (1R denominator)
  const pointMultiplier = assetClass === 'futures' ? (instrument.toUpperCase().includes('NQ') ? 20 : 50) : 1;
  const stopDistance = Math.abs(executedEntry - executedStop);
  const initialRiskDollars = Number((stopDistance * pointMultiplier * positionSize).toFixed(2)) || 500;

  // Realized Net P&L and Realized R
  const priceMove = direction === 'long' ? executedExit - executedEntry : executedEntry - executedExit;
  const grossPnl = Number((priceMove * pointMultiplier * positionSize).toFixed(2));
  const netPnl = Number((grossPnl - commissionFees).toFixed(2));
  const realizedR = initialRiskDollars > 0 ? Number((netPnl / initialRiskDollars).toFixed(2)) : 0;

  // Auto-generate high-definition TradingView SVG charts if not uploaded yet
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

  // Global Clipboard Capture (Ctrl+V / Cmd+V) inside the modal
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (activePasteSlot === 'pre') {
              setPreChartUrl(dataUrl);
            } else {
              setPostChartUrl(dataUrl);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [isOpen, activePasteSlot]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to submit immediately
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleCommitCaseStudy();
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

  const handleFileUpload = (slot: 'pre' | 'post', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (slot === 'pre') setPreChartUrl(dataUrl);
      else setPostChartUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCommitCaseStudy = () => {
    setErrorMessage(null);

    // Validation
    if (!instrument.trim()) {
      setErrorMessage('Please provide an instrument ticker (e.g. NQ, ES, NVDA).');
      setCurrentStep(1);
      return;
    }

    if (plannedEntry === plannedStop || executedEntry === executedStop) {
      setErrorMessage('Entry price and Stop-Loss price cannot be equal.');
      setCurrentStep(1);
      return;
    }

    const isCompliant = ruleResponses.every((r) => r.passed) && mistakes.length === 0;

    const newTrade: Trade = {
      id: `trade-${Date.now().toString().slice(-5)}`,
      accountName: 'Apex 50k Funded #1402',
      setupName,
      instrument: instrument.toUpperCase().trim(),
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
      narrativeWorked: narrativeWorked || 'Execution aligned with market structure.',
      narrativeFailed: narrativeFailed || 'None observed.',
      narrativeLesson: narrativeLesson || 'Maintain discipline and execute playbook setups.',
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-obsidian-surface border border-obsidian-highlight rounded-2xl w-full max-w-5xl shadow-command overflow-hidden flex flex-col my-auto max-h-[92vh] animate-fade-in">
        {/* Header with 2-Step Stepper */}
        <div className="border-b border-obsidian-border bg-obsidian-base p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-trade-emerald/15 border border-trade-emerald/30 text-trade-emerald">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-white text-base tracking-wide">
                Streamlined Trade Logger
              </h2>
              <p className="text-[11px] font-mono text-obsidian-slate">
                Visual Setup → Execution Fills → Diagnostic Autopsy → Daily Pulse Sync
              </p>
            </div>
          </div>

          {/* 2-Step Progress Indicator */}
          <div className="flex items-center bg-obsidian-surface p-1 rounded-xl border border-obsidian-highlight text-xs font-mono">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-trade-emerald text-obsidian-base shadow-sm font-bold'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              <span>1. Visual Setup & Fills</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-trade-emerald text-obsidian-base shadow-sm font-bold'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              <span>2. Diagnostics & Autopsy</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-obsidian-slate hover:text-white p-2 rounded-lg hover:bg-obsidian-highlight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-trade-crimson/20 border-b border-trade-crimson/40 px-4 py-2 text-xs font-mono text-trade-crimson flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: VISUAL SETUP & NUMERICAL FILLS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              {/* Dual-Image Interactive Comparison Canvas Preview */}
              <div className="bg-obsidian-base border border-obsidian-highlight rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-white">
                      Visual Trade Canvas (Before & After)
                    </span>
                    <span className="text-[10px] font-mono text-obsidian-slate">
                      Press <kbd className="bg-obsidian-surface px-1.5 py-0.5 rounded text-white border border-obsidian-border">Ctrl+V</kbd> to paste screenshot
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-obsidian-slate">Clipboard Target:</span>
                    <div className="inline-flex rounded-md border border-obsidian-border p-0.5 bg-obsidian-surface">
                      <button
                        type="button"
                        onClick={() => setActivePasteSlot('pre')}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                          activePasteSlot === 'pre'
                            ? 'bg-trade-emerald text-obsidian-base font-bold'
                            : 'text-obsidian-slate'
                        }`}
                      >
                        Act I (Pre-Trade)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePasteSlot('post')}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                          activePasteSlot === 'post'
                            ? 'bg-trade-crimson text-white font-bold'
                            : 'text-obsidian-slate'
                        }`}
                      >
                        Act III (Post-Trade)
                      </button>
                    </div>

                    <label className="cursor-pointer p-1.5 text-obsidian-slate hover:text-white bg-obsidian-surface border border-obsidian-highlight rounded text-xs" title="Upload chart from files">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(activePasteSlot, e)}
                      />
                    </label>
                  </div>
                </div>

                {/* Interactive Curtain Comparison Preview */}
                <div
                  onPointerMove={(e) => {
                    if (!isDragging) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                    setSliderPosition((x / rect.width) * 100);
                  }}
                  onPointerUp={() => setIsDragging(false)}
                  onPointerLeave={() => setIsDragging(false)}
                  className="relative w-full aspect-[21/9] min-h-[260px] bg-obsidian-surface border border-obsidian-border rounded-xl overflow-hidden select-none"
                >
                  {/* Post-Trade Chart (Underneath) */}
                  <img
                    src={postChartUrl}
                    alt="Post-Trade Outcome"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                  <span className="absolute bottom-2 right-2 bg-obsidian-base/90 border border-obsidian-highlight px-2 py-0.5 rounded text-[10px] font-mono font-bold text-trade-crimson">
                    ACT III: OUTCOME
                  </span>

                  {/* Pre-Trade Chart (Clipped Foreground) */}
                  <div
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    <img
                      src={preChartUrl}
                      alt="Pre-Trade Thesis"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                    <span className="absolute bottom-2 left-2 bg-obsidian-base/90 border border-obsidian-highlight px-2 py-0.5 rounded text-[10px] font-mono font-bold text-trade-emerald">
                      ACT I: THESIS SETUP
                    </span>
                  </div>

                  {/* Draggable Curtain Slider Handle */}
                  <div
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    style={{ left: `${sliderPosition}%` }}
                    className="absolute top-0 bottom-0 w-1 bg-trade-emerald cursor-ew-resize z-20 shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-obsidian-elevated border-2 border-trade-emerald flex items-center justify-center shadow-lg">
                      <ArrowLeftRight className="w-3 h-3 text-trade-emerald" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticker, Direction, Setup, Timeframe */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <label className="text-obsidian-slate block mb-1">Ticker / Instrument</label>
                  <input
                    type="text"
                    required
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                    placeholder="e.g. NQ, ES, NVDA"
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-white font-bold focus:border-trade-emerald outline-none"
                  />
                </div>

                <div>
                  <label className="text-obsidian-slate block mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDirection('long')}
                      className={`py-2 rounded-lg font-bold transition-all ${
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
                      className={`py-2 rounded-lg font-bold transition-all ${
                        direction === 'short'
                          ? 'bg-trade-crimson text-white shadow-glow-crimson'
                          : 'bg-obsidian-base text-obsidian-slate border border-obsidian-border'
                      }`}
                    >
                      SHORT ▼
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-obsidian-slate block mb-1">Playbook Setup Model</label>
                  <select
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-2.5 py-2 text-white outline-none"
                  >
                    {PLAYBOOK_SETUPS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-obsidian-slate block mb-1">Session & Timeframe</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={session}
                      onChange={(e) => setSession(e.target.value as SessionType)}
                      className="bg-obsidian-base border border-obsidian-border rounded-lg px-2 py-2 text-white outline-none"
                    >
                      <option value="ny_am">NY AM</option>
                      <option value="london">London</option>
                      <option value="ny_lunch">Lunch</option>
                      <option value="ny_pm">NY PM</option>
                      <option value="asia">Asia</option>
                    </select>
                    <input
                      type="text"
                      value={executionTimeframe}
                      onChange={(e) => setExecutionTimeframe(e.target.value)}
                      placeholder="e.g. 2m"
                      className="bg-obsidian-base border border-obsidian-border rounded-lg px-2 py-2 text-white outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Numerical Fills: Planned vs Executed + Realized R Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-obsidian-base border border-obsidian-border rounded-xl p-4 font-mono text-xs">
                {/* Planned Levels */}
                <div className="space-y-2 border-r border-obsidian-highlight/50 pr-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-obsidian-slate uppercase">
                    <span>Planned Thesis</span>
                    <span className="text-trade-emerald bg-trade-emerald/10 px-1.5 py-0.5 rounded">
                      1 : {plannedRR} R:R
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Plan Entry</label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedEntry}
                      onChange={(e) => setPlannedEntry(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Plan Stop</label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedStop}
                      onChange={(e) => setPlannedStop(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Plan Target</label>
                    <input
                      type="number"
                      step="0.25"
                      value={plannedTarget}
                      onChange={(e) => setPlannedTarget(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                {/* Executed Fills */}
                <div className="space-y-2 border-r border-obsidian-highlight/50 pr-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-obsidian-slate uppercase">
                    <span>Live Execution Fills</span>
                    <span className={slippage > 0 ? 'text-trade-amber' : 'text-trade-emerald'}>
                      Slip: {slippage > 0 ? `+${slippage}` : `${slippage}`}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Executed Entry</label>
                    <input
                      type="number"
                      step="0.25"
                      value={executedEntry}
                      onChange={(e) => setExecutedEntry(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Executed Stop</label>
                    <input
                      type="number"
                      step="0.25"
                      value={executedStop}
                      onChange={(e) => setExecutedStop(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-obsidian-slate block">Executed Exit</label>
                    <input
                      type="number"
                      step="0.25"
                      value={executedExit}
                      onChange={(e) => setExecutedExit(parseFloat(e.target.value) || 0)}
                      className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                {/* Sizing & Realized Outcome */}
                <div className="space-y-2.5 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-obsidian-slate uppercase">
                    Risk & Yield Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-obsidian-slate block">Size (Contracts)</label>
                      <input
                        type="number"
                        step="1"
                        value={positionSize}
                        onChange={(e) => setPositionSize(parseInt(e.target.value) || 1)}
                        className="w-full bg-obsidian-surface border border-obsidian-border rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-obsidian-slate block">1R Risk ($)</label>
                      <div className="w-full bg-obsidian-surface/60 border border-obsidian-border rounded px-2.5 py-1.5 text-slate-300">
                        ${initialRiskDollars}
                      </div>
                    </div>
                  </div>

                  <div className="bg-obsidian-surface border border-obsidian-highlight rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-obsidian-slate">Net Realized P&L:</span>
                      <strong className={netPnl >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'}>
                        {netPnl >= 0 ? '+' : ''}${netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-obsidian-border/60">
                      <span className="text-[11px] font-bold text-obsidian-slate">Yield ($R):</span>
                      <span
                        className={`text-base font-bold tabular-nums ${
                          realizedR >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'
                        }`}
                      >
                        {realizedR >= 0 ? '+' : ''}{realizedR}R
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ANNOTATION, DIAGNOSTICS & AUTOPSY */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in font-mono text-xs">
              {/* Compliance Pass / Fail Checklist */}
              <div className="bg-obsidian-base border border-obsidian-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-obsidian-highlight pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-trade-emerald" />
                    <span className="font-bold uppercase text-white">
                      Process Discipline Checklist
                    </span>
                  </div>
                  <span className="text-[10px] text-obsidian-slate">
                    Click node to toggle pass/fail
                  </span>
                </div>

                <div className="space-y-2">
                  {ruleResponses.map((rule) => (
                    <div
                      key={rule.ruleId}
                      onClick={() => toggleRule(rule.ruleId)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        rule.passed
                          ? 'bg-obsidian-surface border-trade-emerald/30 text-white'
                          : 'bg-trade-crimson/15 border-trade-crimson text-trade-crimson font-bold'
                      }`}
                    >
                      <span className="text-xs">{rule.ruleText}</span>
                      <span className="text-[11px] font-bold">
                        {rule.passed ? '✓ PASSED' : '✕ BREACHED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Fault Catalog (Preset Tags) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-obsidian-slate">
                    Cataloged Execution Faults (Cost of Mistake Attribution)
                  </span>
                  {mistakes.length > 0 && (
                    <span className="text-trade-crimson font-bold">
                      Leak: -{mistakes.reduce((acc, m) => acc + m.costOfMistakeR, 0).toFixed(2)}R
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYSTEM_MISTAKES.map((m) => {
                    const isSelected = mistakes.some((active) => active.mistakeId === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMistakeTag(m.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-trade-crimson/20 border-trade-crimson text-white font-bold shadow-glow-crimson'
                            : 'bg-obsidian-base border-obsidian-highlight text-obsidian-slate hover:text-white'
                        }`}
                      >
                        <div className="text-[11px]">{m.label}</div>
                        <div className="text-[9px] text-obsidian-slate line-clamp-1 mt-0.5">
                          {m.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neuro-State Selector */}
              <div>
                <span className="font-bold uppercase text-obsidian-slate block mb-2 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-trade-cyan" />
                  Trader Neuro-Mindset State
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'calm_centered', label: 'Calm & Centered' },
                    { key: 'fomo_urge', label: 'FOMO Impulse' },
                    { key: 'hesitant', label: 'Hesitant / Late' },
                    { key: 'chasing_price', label: 'Chasing Extension' },
                    { key: 'revenge_tilted', label: 'Revenge / Tilted' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setNeuroState(item.key as NeuroState)}
                      className={`p-2 rounded-lg border text-center transition-all text-xs font-semibold ${
                        neuroState === item.key
                          ? 'bg-trade-emerald/20 border-trade-emerald text-trade-emerald'
                          : 'bg-obsidian-base border-obsidian-highlight text-obsidian-slate hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-Line Structured Narrative Autopsy Inputs */}
              <div className="space-y-3 font-sans">
                <span className="font-bold font-mono uppercase text-obsidian-slate block text-xs">
                  3-Line Post-Mortem Reflection & Rule Takeaways
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-mono text-trade-emerald block mb-1 font-bold">
                      1. What Worked (Execution Positive)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sized appropriately, waited for candle close confirmation..."
                      value={narrativeWorked}
                      onChange={(e) => setNarrativeWorked(e.target.value)}
                      className="w-full bg-obsidian-base border border-trade-emerald/30 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-emerald"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-trade-crimson block mb-1 font-bold">
                      2. What Failed (Execution Friction / Drag)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Took 1 point slippage on market fill during opening candle..."
                      value={narrativeFailed}
                      onChange={(e) => setNarrativeFailed(e.target.value)}
                      className="w-full bg-obsidian-base border border-trade-crimson/30 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-crimson"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-trade-amber block mb-1 font-bold">
                      3. Actionable Rule Takeaway
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enter using limit orders inside 50% FVG zone instead of market orders..."
                      value={narrativeLesson}
                      onChange={(e) => setNarrativeLesson(e.target.value)}
                      className="w-full bg-obsidian-base border border-trade-amber/30 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-trade-amber"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls with Explicit "Commit Case Study to Daily Pulse" */}
        <div className="border-t border-obsidian-border bg-obsidian-base p-4 flex items-center justify-between">
          <div>
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono text-obsidian-slate hover:text-white border border-obsidian-border"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Fills
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-mono text-obsidian-slate hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-obsidian-highlight hover:bg-obsidian-border text-white transition-all shadow-md"
              >
                <span>Continue to Diagnostics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCommitCaseStudy}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit Case Study to Daily Pulse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
