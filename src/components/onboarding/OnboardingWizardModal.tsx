import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Layers,
  HelpCircle,
  Hash,
  AlertTriangle,
  MessageSquare,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SessionType } from '../../types/trade';
import { UserTradingRules, DEFAULT_USER_RULES } from '../../types/userRules';
import { UserRuleService } from '../../services/userRuleService';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onRulesSaved: (rules: UserTradingRules) => void;
}

const STRATEGY_PRESETS = [
  {
    id: 'fvg_liquidity',
    name: 'Fair Value Gap (FVG) & Liquidity Sweep',
    desc: 'ICT / SMC institutional displacement, sweeps of liquidity pools, and retests of imbalance zones.',
    defaultRR: 2.5,
  },
  {
    id: 'orb_momentum',
    name: 'Opening Range Breakout (ORB)',
    desc: 'High-momentum continuation following break of initial 5m or 15m session range with volume.',
    defaultRR: 2.0,
  },
  {
    id: 'supply_demand',
    name: 'Supply & Demand / Order Blocks',
    desc: 'Mitigation of institutional order blocks and structural pivot zones with rejection candles.',
    defaultRR: 2.0,
  },
  {
    id: 'vwap_reversion',
    name: 'VWAP & Mean Reversion',
    desc: 'Pullbacks to Volume-Weighted Average Price and 2-standard-deviation bands.',
    defaultRR: 1.5,
  },
  {
    id: 'break_retest',
    name: 'Market Structure Break & Retest',
    desc: 'Breakout above key support/resistance followed by clean structural confirmation retest.',
    defaultRR: 2.0,
  },
  {
    id: 'custom',
    name: 'Custom Proprietary Strategy',
    desc: 'Define your personal edge, entry trigger criteria, and invalidation rules.',
    defaultRR: 2.0,
  },
];

const JOURNALING_QUESTIONS = [
  {
    id: 'confirmation_vs_fomo',
    question: 'Did I wait for structural confirmation, or did I enter impulsively out of FOMO?',
    category: 'Patience & Entry Discipline',
  },
  {
    id: 'stop_invalidation',
    question: 'Was my stop-loss placed strictly at the structural invalidation level before pulling the trigger, and did I honor it without moving it?',
    category: 'Risk & Stop Governance',
  },
  {
    id: 'exit_targets',
    question: 'Did I stick to my predefined profit targets and scale plan, or did fear/greed cause me to close prematurely?',
    category: 'Trade Management & Scale-Out',
  },
  {
    id: 'neuro_state',
    question: 'Was my neuro-state calm and centered, or was I seeking dopamine / revenge-trading a prior loss?',
    category: 'Psychological State',
  },
  {
    id: 'probabilistic_edge',
    question: 'If I took this exact setup 100 times in a row with this identical execution, would the mathematical expectancy be positive?',
    category: 'Probabilistic Edge',
  },
  {
    id: 'custom_question',
    question: 'Custom Reflection Question',
    category: 'Your Signature Prompt',
  },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  userId,
  onRulesSaved,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Question 1: Strategy Used
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    'Fair Value Gap (FVG) & Liquidity Sweep',
  ]);
  const [customStrategyName, setCustomStrategyName] = useState<string>('');
  const [minPlannedRR, setMinPlannedRR] = useState<number>(2.0);

  // Question 2: The Session
  const [allowedSessions, setAllowedSessions] = useState<SessionType[]>(['ny_am', 'ny_pm']);

  // Question 3: Number of Trades & Sizing
  const [maxTradesPerDay, setMaxTradesPerDay] = useState<number>(3);
  const [maxContractsPerTrade, setMaxContractsPerTrade] = useState<number>(2);
  const [maxRiskPerTradeValue, setMaxRiskPerTradeValue] = useState<number>(500);

  // Question 4: The Main Question Asked When Journaling
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('confirmation_vs_fomo');
  const [customQuestionText, setCustomQuestionText] = useState<string>('');

  if (!isOpen) return null;

  const toggleStrategy = (stratName: string) => {
    if (selectedStrategies.includes(stratName)) {
      if (selectedStrategies.length > 1) {
        setSelectedStrategies(selectedStrategies.filter((s) => s !== stratName));
      }
    } else {
      setSelectedStrategies([...selectedStrategies, stratName]);
    }
  };

  const toggleSession = (sess: SessionType) => {
    if (allowedSessions.includes(sess)) {
      if (allowedSessions.length > 1) {
        setAllowedSessions(allowedSessions.filter((s) => s !== sess));
      }
    } else {
      setAllowedSessions([...allowedSessions, sess]);
    }
  };

  const getMainQuestionString = () => {
    if (selectedQuestionId === 'custom_question') {
      return customQuestionText.trim() || 'Did I follow my trading plan with 100% execution discipline?';
    }
    const found = JOURNALING_QUESTIONS.find((q) => q.id === selectedQuestionId);
    return found ? found.question : 'Did I wait for structural confirmation, or did I enter impulsively out of FOMO?';
  };

  const handleFinishOnboarding = async () => {
    const finalQuestion = getMainQuestionString();

    const rules: UserTradingRules = {
      id: `rules_${userId || 'guest'}`,
      userId: userId || 'guest',
      tradingStyle: maxTradesPerDay > 4 ? 'scalper' : 'day_trader',
      primaryAssetClass: 'futures',
      primaryStrategies: customStrategyName.trim()
        ? [...selectedStrategies, customStrategyName.trim()]
        : selectedStrategies,
      customStrategyName: customStrategyName.trim(),
      minPlannedRR,
      allowedSessions,
      maxTradesPerDay,
      maxContractsPerTrade,
      maxRiskPerTradeType: 'fiat',
      maxRiskPerTradeValue,
      maxDailyDrawdownR: 3.0,
      maxDailyDrawdownFiat: maxRiskPerTradeValue * 3,
      dailyProfitTargetR: 4.0,
      mainJournalingQuestion: finalQuestion,
      journalingQuestionCategory: selectedQuestionId,
      prohibitedEmotions: ['fomo_urge', 'revenge_tilted', 'chasing_price'],
      structuralStopRequired: true,
      noWideningStops: true,
      requireCandleCloseConfirmation: true,
      customRules: [
        {
          id: 'rule-strat-adherence',
          ruleText: `Executed strictly within verified playbook strategies (${selectedStrategies[0]})`,
          isMandatory: true,
        },
        {
          id: 'rule-session-window',
          ruleText: 'Only entered orders within approved session market hours',
          isMandatory: true,
        },
        {
          id: 'rule-max-trades',
          ruleText: `Respected maximum frequency limit of ${maxTradesPerDay} trades per session`,
          isMandatory: true,
        },
        {
          id: 'rule-journal-question',
          ruleText: `Answered diagnostic autopsy prompt: "${finalQuestion.substring(0, 60)}..."`,
          isMandatory: true,
        },
      ],
      isOnboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    await UserRuleService.saveUserRules(rules, userId);
    onRulesSaved(rules);

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#F59E0B'],
      });
    } catch (e) {
      // fallback
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-obsidian-surface border border-obsidian-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-border bg-obsidian-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-trade-emerald/15 border border-trade-emerald/30 text-trade-emerald flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Personal Trading Discipline Blueprint</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-trade-emerald/20 text-trade-emerald">
                  QUESTION {step} OF 4
                </span>
              </h3>
              <p className="text-xs text-obsidian-slate font-mono">
                Strategy • Allowed Sessions • Trade Frequency • Main Autopsy Question
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
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* QUESTION 1: STRATEGY USED */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-[10px] font-mono uppercase text-trade-emerald tracking-wider block mb-1">
                  Question 1: Edge & Setup Architecture
                </span>
                <h4 className="text-base font-bold text-white mb-1">
                  What primary trading strategy model(s) do you execute?
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  TradeTale will track and calculate the mathematical expectancy ($E$) of each setup to prove whether your edge is real.
                </p>
              </div>

              <div className="space-y-2.5">
                {STRATEGY_PRESETS.map((strat) => {
                  const isSelected = selectedStrategies.includes(strat.name);
                  return (
                    <div
                      key={strat.id}
                      onClick={() => toggleStrategy(strat.name)}
                      className={`p-3.5 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-trade-emerald/10 border-trade-emerald text-white shadow-sm'
                          : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="pr-3">
                        <span className="text-xs font-bold block text-white">{strat.name}</span>
                        <p className="text-[11px] text-obsidian-slate mt-0.5 leading-snug">{strat.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? 'bg-trade-emerald border-trade-emerald text-black' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Custom Strategy */}
              {selectedStrategies.includes('Custom Proprietary Strategy') && (
                <div className="p-3.5 rounded-xl bg-obsidian-card border border-trade-emerald/40 animate-fade-in">
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">
                    Name your proprietary strategy:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. London Sweep into 15m VWAP Retest"
                    value={customStrategyName}
                    onChange={(e) => setCustomStrategyName(e.target.value)}
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trade-emerald"
                  />
                </div>
              )}

              {/* Target R:R */}
              <div className="p-3.5 rounded-xl bg-obsidian-card border border-obsidian-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Minimum Target Risk-to-Reward Ratio</span>
                  <span className="text-[11px] text-obsidian-slate">Setups below this threshold will be flagged</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {[1.5, 2.0, 2.5, 3.0].map((rr) => (
                    <button
                      key={rr}
                      type="button"
                      onClick={() => setMinPlannedRR(rr)}
                      className={`px-2.5 py-1 rounded-lg border ${
                        minPlannedRR === rr
                          ? 'bg-trade-emerald text-obsidian-base border-trade-emerald font-bold'
                          : 'bg-obsidian-base text-slate-400 border-obsidian-border'
                      }`}
                    >
                      1:{rr.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 2: THE SESSION */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-[10px] font-mono uppercase text-trade-cyan tracking-wider block mb-1">
                  Question 2: Operating Window
                </span>
                <h4 className="text-base font-bold text-white mb-1">
                  Which market trading session(s) are you permitted to execute in?
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Overtrading outside high-probability session liquidity windows is the #1 destroyer of prop trader accounts.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'ny_am',
                    name: 'New York AM Open',
                    time: '09:30 – 11:30 EST',
                    desc: 'Peak institutional liquidity, macro news catalysts, and true trend expansions.',
                    recommended: true,
                  },
                  {
                    id: 'london',
                    name: 'London Open Session',
                    time: '03:00 – 07:00 EST',
                    desc: 'European banks open, high clean trend continuity for FX and index futures.',
                    recommended: true,
                  },
                  {
                    id: 'ny_pm',
                    name: 'New York PM Close',
                    time: '13:30 – 16:00 EST',
                    desc: 'End-of-day institutional rebalancing, algorithmic push into the closing bell.',
                    recommended: false,
                  },
                  {
                    id: 'asia',
                    name: 'Tokyo / Asian Session',
                    time: '19:00 – 02:00 EST',
                    desc: 'Lower volatility, mean-reverting ranges, ideal for FX scalpers and crypto.',
                    recommended: false,
                  },
                  {
                    id: 'ny_lunch',
                    name: 'New York Lunch Hour (Chop Zone)',
                    time: '11:30 – 13:30 EST',
                    desc: 'Low liquidity, market maker stop-hunts, and unpredictable whipsaws. (Warning: high risk)',
                    recommended: false,
                    isWarning: true,
                  },
                ].map((sess) => {
                  const isSelected = allowedSessions.includes(sess.id as SessionType);
                  return (
                    <div
                      key={sess.id}
                      onClick={() => toggleSession(sess.id as SessionType)}
                      className={`p-3.5 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        isSelected
                          ? sess.isWarning
                            ? 'bg-trade-rose/10 border-trade-rose text-white'
                            : 'bg-trade-cyan/10 border-trade-cyan text-white shadow-sm'
                          : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Clock className={`w-4 h-4 mt-0.5 ${isSelected ? (sess.isWarning ? 'text-trade-rose' : 'text-trade-cyan') : 'text-slate-500'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sess.name}</span>
                            <span className="text-[10px] font-mono text-obsidian-slate">({sess.time})</span>
                            {sess.recommended && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-trade-emerald/20 text-trade-emerald">
                                RECOMMENDED
                              </span>
                            )}
                            {sess.isWarning && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-trade-rose/20 text-trade-rose">
                                DANGER ZONE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-obsidian-slate mt-0.5 leading-snug">{sess.desc}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? (sess.isWarning ? 'bg-trade-rose border-trade-rose text-white' : 'bg-trade-cyan border-trade-cyan text-black') : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-obsidian-base border border-obsidian-border text-[11px] font-mono text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-trade-amber shrink-0" />
                <span>Trade entries detected outside these selected windows will automatically be flagged as Discipline Rule Breaches.</span>
              </div>
            </div>
          )}

          {/* QUESTION 3: NUMBER OF TRADES & SIZING */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-[10px] font-mono uppercase text-trade-amber tracking-wider block mb-1">
                  Question 3: Execution Frequency & Capital Control
                </span>
                <h4 className="text-base font-bold text-white mb-1">
                  How many trades are you allowed to take in a single session?
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Restricting execution volume forces selectivity for A+ setups and prevents emotional revenge cascades.
                </p>
              </div>

              {/* Number of Trades Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    count: 2,
                    label: 'Sniper Focus (2 Trades)',
                    desc: 'A+ Setups only. Immediate shutdown after 2 executions.',
                    badge: 'RECOMMENDED',
                  },
                  {
                    count: 3,
                    label: 'Disciplined Day (3 Trades)',
                    desc: 'Balanced intraday frequency for prop firm evaluations.',
                    badge: 'STANDARD',
                  },
                  {
                    count: 5,
                    label: 'Active Scalper (5 Trades)',
                    desc: 'Fast intraday rotation with tight stop management.',
                    badge: 'MAX CEILING',
                  },
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => setMaxTradesPerDay(tier.count)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      maxTradesPerDay === tier.count
                        ? 'bg-trade-amber/15 border-trade-amber text-white shadow-sm'
                        : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-base text-trade-amber inline-block mb-2 font-bold">
                      {tier.badge}
                    </span>
                    <span className="font-bold text-xs block text-white mb-1">{tier.label}</span>
                    <p className="text-[11px] text-obsidian-slate leading-snug">{tier.desc}</p>
                  </button>
                ))}
              </div>

              {/* Max Contracts/Lots per Trade */}
              <div className="p-4 rounded-xl bg-obsidian-card border border-obsidian-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Maximum Position Sizing in a Single Trade</span>
                    <span className="text-[11px] text-obsidian-slate">Enforces uniform risk sizing across all executions</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-trade-amber">
                    {maxContractsPerTrade} {maxContractsPerTrade === 1 ? 'Contract / Lot' : 'Contracts / Lots'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setMaxContractsPerTrade(qty)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                        maxContractsPerTrade === qty
                          ? 'bg-trade-amber text-obsidian-base border-trade-amber'
                          : 'bg-obsidian-base text-slate-300 border-obsidian-border'
                      }`}
                    >
                      {qty} {qty === 1 ? 'Contract' : 'Contracts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1R Dollar Budget */}
              <div className="p-4 rounded-xl bg-obsidian-card border border-obsidian-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Max Dollar Risk Per Trade (1R Denominator)</span>
                  <span className="text-[11px] text-obsidian-slate">Used to normalize your $R$-multiples across all trades</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {[250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMaxRiskPerTradeValue(amt)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        maxRiskPerTradeValue === amt
                          ? 'bg-trade-emerald text-obsidian-base border-trade-emerald font-bold'
                          : 'bg-obsidian-base text-slate-400 border-obsidian-border'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 4: MAIN QUESTION ASKED WHEN JOURNALING */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-[10px] font-mono uppercase text-trade-emerald tracking-wider block mb-1">
                  Question 4: The Core Autopsy Reflection
                </span>
                <h4 className="text-base font-bold text-white mb-1">
                  What is the main question you must answer when journaling a trade?
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  This signature prompt will be anchored at the top of your 3-Act Autopsy to enforce ruthless self-honesty after every order.
                </p>
              </div>

              <div className="space-y-2.5">
                {JOURNALING_QUESTIONS.map((item) => {
                  const isSelected = selectedQuestionId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedQuestionId(item.id)}
                      className={`p-3.5 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-trade-emerald/10 border-trade-emerald text-white shadow-sm'
                          : 'bg-obsidian-card border-obsidian-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="pr-3">
                        <span className="text-[10px] font-mono text-obsidian-slate block mb-1 uppercase font-semibold">
                          {item.category}
                        </span>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          "{item.question}"
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? 'bg-trade-emerald border-trade-emerald text-black' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Question Text Input */}
              {selectedQuestionId === 'custom_question' && (
                <div className="p-4 rounded-xl bg-obsidian-card border border-trade-emerald/40 animate-fade-in space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">
                    Write your personal signature journaling question:
                  </label>
                  <textarea
                    rows={2}
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    placeholder="e.g. Did I execute my edge without hesitation and let the market decide the outcome?"
                    className="w-full bg-obsidian-base border border-obsidian-border rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trade-emerald font-sans"
                  />
                </div>
              )}

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-obsidian-base border border-obsidian-border font-mono text-xs space-y-2">
                <span className="text-[10px] text-obsidian-slate block uppercase">
                  Live Preview in 3-Act Autopsy:
                </span>
                <p className="text-trade-emerald italic font-sans text-sm">
                  "{getMainQuestionString()}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="px-6 py-4 border-t border-obsidian-border bg-obsidian-card flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-obsidian-base border border-obsidian-border transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lock Blueprint & Enter Terminal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
