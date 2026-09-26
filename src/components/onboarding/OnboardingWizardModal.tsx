import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Brain,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssetClass, NeuroState, SessionType } from '../../types/trade';
import { UserTradingRules } from '../../types/userRules';
import { UserRuleService } from '../../services/userRuleService';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onRulesSaved: (rules: UserTradingRules) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  userId,
  onRulesSaved,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Trading Identity & Primary Focus
  const [tradingStyle, setTradingStyle] = useState<'scalper' | 'day_trader' | 'swing_trader'>('day_trader');
  const [primaryAssetClass, setPrimaryAssetClass] = useState<AssetClass>('futures');

  // Step 2: Risk Budgeting & Safety Gate
  const [maxRiskPerTradeType, setMaxRiskPerTradeType] = useState<'fiat' | 'percentage'>('fiat');
  const [maxRiskPerTradeValue, setMaxRiskPerTradeValue] = useState<number>(500);
  const [maxDailyDrawdownR, setMaxDailyDrawdownR] = useState<number>(3.0);
  const [maxDailyDrawdownFiat, setMaxDailyDrawdownFiat] = useState<number>(1500);
  const [dailyProfitTargetR, setDailyProfitTargetR] = useState<number>(4.0);
  const [maxTradesPerDay, setMaxTradesPerDay] = useState<number>(4);

  // Step 3: Allowed Sessions
  const [allowedSessions, setAllowedSessions] = useState<SessionType[]>(['ny_am', 'ny_pm']);

  // Step 4: Prohibited Neuro-States & Emotional Defenses
  const [prohibitedEmotions, setProhibitedEmotions] = useState<NeuroState[]>([
    'fomo_urge',
    'revenge_tilted',
    'chasing_price',
  ]);

  // Step 5: Structural Golden Rules
  const [structuralStopRequired, setStructuralStopRequired] = useState<boolean>(true);
  const [noWideningStops, setNoWideningStops] = useState<boolean>(true);
  const [requireCandleCloseConfirmation, setRequireCandleCloseConfirmation] = useState<boolean>(true);
  const [minPlannedRR, setMinPlannedRR] = useState<number>(2.0);
  const [customRules, setCustomRules] = useState<{ id: string; ruleText: string; isMandatory: boolean }[]>([
    { id: 'custom-1', ruleText: 'Step away from the desk for 15 minutes after any 2 consecutive losses', isMandatory: true },
    { id: 'custom-2', ruleText: 'Never add contracts to an adverse excursion (no averaging down)', isMandatory: true },
  ]);
  const [newRuleInput, setNewRuleInput] = useState<string>('');

  if (!isOpen) return null;

  const toggleSession = (sess: SessionType) => {
    if (allowedSessions.includes(sess)) {
      if (allowedSessions.length > 1) {
        setAllowedSessions(allowedSessions.filter((s) => s !== sess));
      }
    } else {
      setAllowedSessions([...allowedSessions, sess]);
    }
  };

  const toggleProhibitedEmotion = (emotion: NeuroState) => {
    if (prohibitedEmotions.includes(emotion)) {
      setProhibitedEmotions(prohibitedEmotions.filter((e) => e !== emotion));
    } else {
      setProhibitedEmotions([...prohibitedEmotions, emotion]);
    }
  };

  const addCustomRule = () => {
    if (!newRuleInput.trim()) return;
    setCustomRules([
      ...customRules,
      {
        id: `custom-${Date.now()}`,
        ruleText: newRuleInput.trim(),
        isMandatory: true,
      },
    ]);
    setNewRuleInput('');
  };

  const removeCustomRule = (id: string) => {
    setCustomRules(customRules.filter((r) => r.id !== id));
  };

  const handleFinishOnboarding = async () => {
    const rules: UserTradingRules = {
      id: `rules_${userId || 'guest'}`,
      userId: userId || 'guest',
      tradingStyle,
      primaryAssetClass,
      maxRiskPerTradeType,
      maxRiskPerTradeValue,
      maxDailyDrawdownR,
      maxDailyDrawdownFiat,
      dailyProfitTargetR,
      maxTradesPerDay,
      allowedSessions,
      prohibitedEmotions,
      structuralStopRequired,
      noWideningStops,
      requireCandleCloseConfirmation,
      minPlannedRR,
      customRules,
      isOnboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    await UserRuleService.saveUserRules(rules, userId);
    onRulesSaved(rules);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#F59E0B'],
      });
    } catch (e) {
      // fallback
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-obsidian-surface border border-obsidian-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-border bg-obsidian-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-trade-emerald/15 border border-trade-emerald/30 text-trade-emerald flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Personal Trading Rule Builder</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-trade-emerald/20 text-trade-emerald">
                  STEP {step} OF 5
                </span>
              </h3>
              <p className="text-xs text-obsidian-slate font-mono">
                Calibrating your mathematical and psychological guardrails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-obsidian-slate hover:text-white p-1 rounded-lg hover:bg-obsidian-highlight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-obsidian-highlight h-1">
          <div
            className="bg-trade-emerald h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: IDENTITY & ASSET */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  1. What is your primary trading asset class?
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-sans">
                  TradeTale normalizes performance in $R$-units across all instruments.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'futures', label: 'CME Futures', desc: 'NQ, ES, YM, CL' },
                    { id: 'forex', label: 'Forex (FX)', desc: 'EUR/USD, GBP/JPY' },
                    { id: 'equities', label: 'Equities', desc: 'TSLA, NVDA, AAPL' },
                    { id: 'crypto', label: 'Crypto', desc: 'BTC, ETH Perpetual' },
                  ].map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setPrimaryAssetClass(asset.id as AssetClass)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        primaryAssetClass === asset.id
                          ? 'bg-trade-emerald/10 border-trade-emerald text-white shadow-sm'
                          : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="font-bold text-xs block text-white">{asset.label}</span>
                      <span className="text-[10px] font-mono text-obsidian-slate">{asset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  2. What is your primary execution style?
                </h4>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { id: 'scalper', label: 'Scalper', desc: '< 5m holds, quick momentum' },
                    { id: 'day_trader', label: 'Day Trader', desc: 'Intraday, flat at close' },
                    { id: 'swing_trader', label: 'Swing Trader', desc: 'Multi-day structural swings' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setTradingStyle(style.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        tradingStyle === style.id
                          ? 'bg-trade-cyan/10 border-trade-cyan text-white'
                          : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="font-bold text-xs block text-white">{style.label}</span>
                      <span className="text-[10px] text-obsidian-slate">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RISK BUDGET & DRAWDOWN CEILINGS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                  <span>1. Max Risk Budget Per Single Trade (1R Denominator)</span>
                  <span className="text-xs font-mono text-trade-emerald">
                    ${maxRiskPerTradeValue} USD (1R)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mb-3 font-sans">
                  The initial dollar risk of every trade will be measured against this baseline.
                </p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[250, 500, 1000, 1500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setMaxRiskPerTradeValue(amt)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold border ${
                        maxRiskPerTradeValue === amt
                          ? 'bg-trade-emerald text-obsidian-base border-trade-emerald'
                          : 'bg-obsidian-card text-slate-300 border-obsidian-border hover:border-slate-600'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-card border border-obsidian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Daily Max Drawdown Safety Ceiling
                    </span>
                    <span className="text-[11px] text-obsidian-slate">
                      Breaching this threshold activates the Trade Entry Lockout Gate.
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-trade-rose">
                    -{maxDailyDrawdownR}R (-${maxDailyDrawdownFiat})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { r: 2.0, fiat: 1000 },
                    { r: 3.0, fiat: 1500 },
                    { r: 4.0, fiat: 2000 },
                  ].map((tier) => (
                    <button
                      key={tier.r}
                      onClick={() => {
                        setMaxDailyDrawdownR(tier.r);
                        setMaxDailyDrawdownFiat(tier.fiat);
                      }}
                      className={`py-2 rounded-lg text-xs font-mono border ${
                        maxDailyDrawdownR === tier.r
                          ? 'bg-trade-rose/20 text-trade-rose border-trade-rose font-bold'
                          : 'bg-obsidian-base text-slate-400 border-obsidian-border'
                      }`}
                    >
                      -{tier.r}R (-${tier.fiat})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-obsidian-card border border-obsidian-border">
                  <span className="text-[11px] text-slate-400 block font-mono">Daily Profit Target</span>
                  <span className="text-sm font-mono font-bold text-trade-emerald mt-1 block">
                    +{dailyProfitTargetR}R ($2,000)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-obsidian-card border border-obsidian-border">
                  <span className="text-[11px] text-slate-400 block font-mono">Max Trades Per Session</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">
                    {maxTradesPerDay} Executions
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SESSION DISCIPLINE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Allowed Market Session Windows
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-sans">
                  Any trade taken outside your designated hours will be recorded as an off-session rule violation.
                </p>
                <div className="space-y-2.5">
                  {[
                    { id: 'asia', name: 'Tokyo / Asian Session', time: '19:00 - 02:00 EST' },
                    { id: 'london', name: 'London Open Session', time: '03:00 - 07:00 EST' },
                    { id: 'ny_am', name: 'New York AM Open', time: '09:30 - 11:30 EST (High Volatility)' },
                    { id: 'ny_lunch', name: 'New York Lunch Hour', time: '11:30 - 13:30 EST (Chop Zone)' },
                    { id: 'ny_pm', name: 'New York PM Close', time: '13:30 - 16:00 EST' },
                  ].map((sess) => {
                    const isSelected = allowedSessions.includes(sess.id as SessionType);
                    return (
                      <div
                        key={sess.id}
                        onClick={() => toggleSession(sess.id as SessionType)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-trade-emerald/10 border-trade-emerald text-white'
                            : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-trade-emerald' : 'text-slate-500'}`} />
                          <div>
                            <span className="text-xs font-bold block text-white">{sess.name}</span>
                            <span className="text-[10px] font-mono text-obsidian-slate">{sess.time}</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-trade-emerald border-trade-emerald text-black' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROHIBITED EMOTIONS */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Prohibited Psychological States (Defense Gates)
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-sans">
                  Select the emotional triggers that most frequently sabotage your performance. Logging these states will immediately trigger a Discipline Leak attribution.
                </p>
                <div className="space-y-2.5">
                  {[
                    { id: 'fomo_urge', label: 'FOMO Impulse Urge', desc: 'Entering late without structural confirmation out of fear of missing the move' },
                    { id: 'revenge_tilted', label: 'Revenge / Tilted State', desc: 'Taking an immediate trade to win back capital right after a red stop-out' },
                    { id: 'chasing_price', label: 'Chasing Extended Candles', desc: 'Jumping in after multiple consecutive green/red momentum candles' },
                    { id: 'hesitant', label: 'Hesitation on A+ Setup', desc: 'Freezing when valid parameters align, then entering poorly late' },
                  ].map((emo) => {
                    const isSelected = prohibitedEmotions.includes(emo.id as NeuroState);
                    return (
                      <div
                        key={emo.id}
                        onClick={() => toggleProhibitedEmotion(emo.id as NeuroState)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-trade-rose/10 border-trade-rose/80 text-white'
                            : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Flame className={`w-4 h-4 ${isSelected ? 'text-trade-rose' : 'text-slate-500'}`} />
                          <div>
                            <span className="text-xs font-bold block text-white">{emo.label}</span>
                            <span className="text-[10px] text-obsidian-slate">{emo.desc}</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-trade-rose border-trade-rose text-white' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: STRUCTURAL RULES & CUSTOM GOLDEN RULES */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Non-Negotiable Execution Constraints
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-sans">
                  These core rules will form the pass/fail checklist in your 3-Act Trade Autopsies.
                </p>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setStructuralStopRequired(!structuralStopRequired)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      structuralStopRequired ? 'bg-trade-emerald/10 border-trade-emerald' : 'bg-obsidian-card border-obsidian-border'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">
                      Hard structural stop-loss placed immediately upon order fill
                    </span>
                    <span className="text-xs text-trade-emerald">{structuralStopRequired ? 'ENABLED' : 'OFF'}</span>
                  </div>

                  <div
                    onClick={() => setNoWideningStops(!noWideningStops)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      noWideningStops ? 'bg-trade-emerald/10 border-trade-emerald' : 'bg-obsidian-card border-obsidian-border'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">
                      Strict prohibition: Never widen or remove stop loss under drawdown
                    </span>
                    <span className="text-xs text-trade-emerald">{noWideningStops ? 'ENABLED' : 'OFF'}</span>
                  </div>

                  <div
                    onClick={() => setRequireCandleCloseConfirmation(!requireCandleCloseConfirmation)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      requireCandleCloseConfirmation ? 'bg-trade-emerald/10 border-trade-emerald' : 'bg-obsidian-card border-obsidian-border'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">
                      Wait for timeframe candle close before pulling order trigger
                    </span>
                    <span className="text-xs text-trade-emerald">{requireCandleCloseConfirmation ? 'ENABLED' : 'OFF'}</span>
                  </div>
                </div>
              </div>

              {/* Custom Trader Rules */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2 uppercase font-mono text-slate-400">
                  Your Custom Golden Rules
                </h4>
                <div className="space-y-2 mb-3">
                  {customRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs"
                    >
                      <span className="text-slate-200">{rule.ruleText}</span>
                      <button
                        onClick={() => removeCustomRule(rule.id)}
                        className="text-slate-500 hover:text-trade-rose transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomRule()}
                    placeholder="e.g. Walk away from charts after 2 red trades in a row..."
                    className="flex-1 bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trade-emerald"
                  />
                  <button
                    onClick={addCustomRule}
                    className="px-3 py-2 bg-obsidian-card hover:bg-obsidian-highlight border border-obsidian-border rounded-lg text-xs font-mono text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-4 border-t border-obsidian-border bg-obsidian-card flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-obsidian-base border border-obsidian-border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base transition-all"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lock Rules & Start Journaling</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
