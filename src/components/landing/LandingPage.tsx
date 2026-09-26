import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  Activity,
  Flame,
  CheckCircle2,
  Compass,
  Zap,
  BarChart3,
  Lock,
  ChevronRight,
  Terminal,
  Clock,
  Sparkles,
  Smartphone,
  Server,
  Play,
  RotateCcw,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchTerminal: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchTerminal,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'logger' | 'autopsy' | 'analytics' | 'broker'>('logger');

  return (
    <div className="min-h-screen bg-obsidian-base text-slate-100 flex flex-col font-sans selection:bg-trade-emerald selection:text-black">
      {/* 1. TOP ANNOUNCEMENT & NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-obsidian-base/90 backdrop-blur-md border-b border-obsidian-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={onLaunchTerminal}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-obsidian-highlight bg-obsidian-card p-0.5 shadow-lg group-hover:border-trade-emerald transition-colors">
              <img
                src="/logo.png"
                alt="TradeTale Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wider text-base">
                  TRADESTORY
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-trade-emerald/15 text-trade-emerald border border-trade-emerald/30">
                  EMPIRICAL
                </span>
              </div>
              <p className="text-[10px] font-mono text-obsidian-slate hidden sm:block">
                POST-MORTEM COMMAND
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
            <a href="#vision" className="hover:text-trade-emerald transition-colors">
              Vision
            </a>
            <a href="#models" className="hover:text-trade-emerald transition-colors">
              Quantitative Edge
            </a>
            <a href="#modules" className="hover:text-trade-emerald transition-colors">
              3-Act Architecture
            </a>
            <a href="#broker-vault" className="hover:text-trade-emerald transition-colors">
              Broker Vault
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian-card hover:bg-obsidian-highlight border border-trade-emerald/40 text-trade-emerald transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
            <button
              onClick={onLaunchTerminal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald transition-all transform active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch Terminal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-obsidian-border/50">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-trade-emerald/15 to-trade-cyan/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-card border border-obsidian-highlight text-xs font-mono text-slate-300 mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-trade-emerald animate-pulse" />
            <span>Next-Gen Quantitative Trade Journal & Autopsy Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Separate Market Randomness From{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-trade-emerald via-emerald-300 to-trade-cyan">
              Execution Discipline.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-400 mb-10 font-sans leading-relaxed">
            Stop recording vanity dollar metrics in passive spreadsheets. TradeTale quantifies your psychological edge in{' '}
            <strong className="text-slate-200">Risk-Adjusted $R$-Units</strong>, reveals your monetary{' '}
            <strong className="text-trade-rose">Discipline Leak</strong>, and autopsies every trade through a structured 3-act narrative before tilt destroys your capital.
          </p>

          {/* CTAs Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onLaunchTerminal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-mono text-sm font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-mono text-sm font-semibold bg-obsidian-card hover:bg-obsidian-highlight border border-obsidian-border hover:border-slate-600 text-slate-200 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-trade-emerald" />
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Live Telemetry Ticker Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto p-3 rounded-2xl bg-obsidian-card/80 border border-obsidian-border text-left shadow-2xl backdrop-blur-sm">
            <div className="p-3 border-r border-obsidian-border/60">
              <span className="text-[10px] font-mono text-obsidian-slate block uppercase">Session Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-trade-emerald animate-ping" />
                <span className="text-xs font-mono font-bold text-white">NY AM OPEN</span>
              </div>
            </div>
            <div className="p-3 border-r border-obsidian-border/60">
              <span className="text-[10px] font-mono text-obsidian-slate block uppercase">Session Benchmark</span>
              <span className="text-xs font-mono font-bold text-trade-emerald mt-1 block">+4.25R Realized</span>
            </div>
            <div className="p-3 border-r border-obsidian-border/60">
              <span className="text-[10px] font-mono text-obsidian-slate block uppercase">Rule Adherence Index</span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">94.0% Execution Rate</span>
            </div>
            <div className="p-3">
              <span className="text-[10px] font-mono text-obsidian-slate block uppercase">Drawdown Safety</span>
              <span className="text-xs font-mono font-bold text-trade-emerald mt-1 block">Safe Zone (-0.4R / -3.0R)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE QUANTITATIVE MATHEMATICAL FOUNDATIONS */}
      <section id="models" className="py-20 sm:py-24 bg-obsidian-surface/60 border-b border-obsidian-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-trade-emerald mb-3">
              Mathematical Rigor
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 3 Quantitative Models Powering TradeTale
            </h3>
            <p className="text-sm sm:text-base text-slate-400 mt-3 font-sans">
              Traditional spreadsheets reward reckless gambles if they finish green. TradeTale standardizes performance around pure mathematical expectancy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Model 1: R-Multiple Normalization */}
            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border hover:border-trade-emerald/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-trade-emerald/10 border border-trade-emerald/30 text-trade-emerald flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  1. $R$-Multiple Normalization
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Standardizes every win and loss relative to pre-defined stop risk (1R = Stop Distance × Position Size). Eliminates fiat distortion across micro futures, equities, and crypto accounts.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-base border border-obsidian-border/80 font-mono text-[11px] text-trade-emerald">
                Realized R = Net P&L / Initial 1R Risk
              </div>
            </div>

            {/* Model 2: Discipline Leak Delta */}
            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border hover:border-trade-rose/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-trade-rose/10 border border-trade-rose/30 text-trade-rose flex items-center justify-center mb-5">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  2. Discipline Leak Delta ($\Delta R$)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Isolates the exact financial penalty forfeited to emotional mistakes: moving stops, FOMO impulse entries, and revenge sizing. Quantified dynamically in both $R$-units and USD.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-base border border-obsidian-border/80 font-mono text-[11px] text-trade-rose">
                ΔR Leak = ∑ Rule-Compliant R - ∑ Actual R
              </div>
            </div>

            {/* Model 3: Expectancy Engine */}
            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border hover:border-trade-cyan/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-trade-cyan/10 border border-trade-cyan/30 text-trade-cyan flex items-center justify-center mb-5">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  3. Mathematical Expectancy
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Calculates the mathematical edge ($E$) of every distinct setup. When a setup model exhibits non-viable expectancy, TradeTale automatically sounds a <em>Setup Retirement</em> trigger.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-base border border-obsidian-border/80 font-mono text-[11px] text-trade-cyan">
                E = (Win% × Avg Win R) - (Loss% × Avg Loss R)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 FUNCTIONAL CORE MODULES */}
      <section id="modules" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-trade-emerald mb-3">
              Workflow Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              An Active 3-Act Narrative & Autopsy Workflow
            </h3>
            <p className="text-sm sm:text-base text-slate-400 mt-3 font-sans">
              Designed around how elite traders actually operate: plan with clarity, execute without hesitation, and autopsy without ego.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            <button
              onClick={() => setActiveFeatureTab('logger')}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
                activeFeatureTab === 'logger'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-glow-emerald'
                  : 'bg-obsidian-card text-slate-400 hover:text-white border border-obsidian-border'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3-Act Narrative Logger</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('autopsy')}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
                activeFeatureTab === 'autopsy'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-glow-emerald'
                  : 'bg-obsidian-card text-slate-400 hover:text-white border border-obsidian-border'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Trade Autopsy Split-View</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('analytics')}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
                activeFeatureTab === 'analytics'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-glow-emerald'
                  : 'bg-obsidian-card text-slate-400 hover:text-white border border-obsidian-border'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Discipline Overlay Curve</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('broker')}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
                activeFeatureTab === 'broker'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-glow-emerald'
                  : 'bg-obsidian-card text-slate-400 hover:text-white border border-obsidian-border'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Broker Vault Integration</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="p-8 rounded-3xl bg-obsidian-card border border-obsidian-border/80 shadow-2xl">
            {activeFeatureTab === 'logger' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-trade-emerald/20 text-trade-emerald font-semibold uppercase">
                    HotKey: 'N' Trigger
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                    The 3-Act Narrative Logger
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                    Logging a trade shouldn't take 10 minutes in an ugly spreadsheet. TradeTale breaks recording into 3 psychological moments:
                  </p>
                  <ul className="space-y-3 text-xs font-mono text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Act I — The Thesis:</strong> Structural invalidation, planned R:R, and pre-trade chart slot.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Act II — Live Execution:</strong> Fill price, slippage offset, and biometric <em>Neuro-State</em> selector.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Act III — The Autopsy:</strong> Binary rule audit, post-trade chart, and structured 3-line post-mortem.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onLaunchTerminal}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-obsidian-highlight hover:bg-slate-700 text-white transition-colors"
                  >
                    <span>Test Logger in Terminal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-obsidian-base border border-obsidian-border font-mono text-xs text-slate-300 space-y-4">
                  <div className="flex items-center justify-between border-b border-obsidian-border/80 pb-3">
                    <span className="text-slate-400">SESSION: NY AM OPEN</span>
                    <span className="text-trade-emerald">PLANNED R:R: 1 : 3.67</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-obsidian-card">
                      <span className="text-[10px] text-slate-500 block">ENTRY</span>
                      <span className="font-bold text-white">20,412.50</span>
                    </div>
                    <div className="p-2 rounded bg-obsidian-card">
                      <span className="text-[10px] text-slate-500 block">STOP (1R)</span>
                      <span className="font-bold text-trade-rose">20,385.00</span>
                    </div>
                    <div className="p-2 rounded bg-obsidian-card">
                      <span className="text-[10px] text-slate-500 block">TARGET</span>
                      <span className="font-bold text-trade-emerald">20,480.00</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-trade-emerald/10 border border-trade-emerald/20 text-trade-emerald text-[11px]">
                    ✓ Rule Validated: Waited for 5-minute candle close confirmation
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'autopsy' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-trade-cyan/20 text-trade-cyan font-semibold uppercase">
                    Split-Screen Forensic Review
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                    Trade Autopsy Split-View
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                    Compare what you thought would happen with what the market actually printed. Inspect planned vs. realized price paths side-by-side with an interactive dual-canvas slider.
                  </p>
                  <ul className="space-y-3 text-xs font-mono text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-cyan shrink-0 mt-0.5" />
                      <span><strong>Dual-Timeline Visualizer:</strong> Traces execution path, scale-out milestones, and slippage.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-cyan shrink-0 mt-0.5" />
                      <span><strong>Neuro-State Reflection:</strong> Pinpoints the exact emotions (FOMO, Hesitation, Revenge) active at fill.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-cyan shrink-0 mt-0.5" />
                      <span><strong>3-Line Post-Mortem:</strong> 1. What worked, 2. What failed, 3. The actionable rule lesson.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onLaunchTerminal}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-obsidian-highlight hover:bg-slate-700 text-white transition-colors"
                  >
                    <span>Inspect Live Autopsy</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-obsidian-base border border-obsidian-border font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-obsidian-border pb-2">
                    <span>NQ Futures — Liquidity Sweep + FVG</span>
                    <span className="text-trade-emerald">+2.85R Realized</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-obsidian-card border border-obsidian-border/60">
                      <span className="text-[10px] text-slate-400 block mb-1">PRE-TRADE THESIS</span>
                      <p className="text-[11px] text-slate-300 leading-snug">London high swept at 09:32 EST. Waiting for Fair Value Gap displacement candle on 2m.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-obsidian-card border border-obsidian-border/60">
                      <span className="text-[10px] text-slate-400 block mb-1">POST-TRADE AUTOPSY</span>
                      <p className="text-[11px] text-slate-300 leading-snug">Target filled at +2.85R. Scaled 50% early due to minor hesitation on VWAP retest.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-obsidian-card font-mono text-[11px] text-slate-300">
                    <span className="text-trade-emerald font-semibold">Lesson:</span> Trust structural invalidation and let runner hit final target.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-trade-rose/20 text-trade-rose font-semibold uppercase">
                    Discipline Analytics Engine
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                    The Discipline Overlay Curve
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                    The single most eye-opening chart in trading. By overlaying your theoretical 100% rule-adherent equity over your realized equity, TradeTale reveals the exact monetary leak drained by poor habits.
                  </p>
                  <ul className="space-y-3 text-xs font-mono text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Line A (Muted Emerald):</strong> Equity curve if every trade had followed 100% of your rules.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-rose shrink-0 mt-0.5" />
                      <span><strong>Line B (Dotted Crimson):</strong> Realized gross equity dragged down by undisciplined behavior.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-amber shrink-0 mt-0.5" />
                      <span><strong>Emotional Partition:</strong> Expectancy ranked by neuro-state (Calm vs. FOMO vs. Revenge).</span>
                    </li>
                  </ul>
                  <button
                    onClick={onLaunchTerminal}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-obsidian-highlight hover:bg-slate-700 text-white transition-colors"
                  >
                    <span>View Analytics in Terminal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-obsidian-base border border-obsidian-border font-mono text-xs text-slate-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DISCIPLINE LEAK AUDIT</span>
                    <span className="text-trade-rose font-bold">-19.3R / -$9,650</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] p-2 rounded bg-obsidian-card">
                      <span className="text-slate-300">Widened Stop Losses (7 trades)</span>
                      <span className="text-trade-rose font-semibold">-$4,200 (-8.4R)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] p-2 rounded bg-obsidian-card">
                      <span className="text-slate-300">FOMO Impulse Entries (9 trades)</span>
                      <span className="text-trade-rose font-semibold">-$3,450 (-6.9R)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] p-2 rounded bg-obsidian-card">
                      <span className="text-slate-300">Chasing Extended Candles (4 trades)</span>
                      <span className="text-trade-rose font-semibold">-$2,000 (-4.0R)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Fixing just these 3 behavioral leaks would increase net returns by +34.8%.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'broker' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-trade-emerald/20 text-trade-emerald font-semibold uppercase">
                    Real-Time Broker Integration
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                    The Broker Connection Vault
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                    Link your active accounts (Tradovate, Interactive Brokers, TradeStation, MetaTrader). TradeTale automatically streams executions, timestamps, and fill prices so you spend zero time typing numbers.
                  </p>
                  <ul className="space-y-3 text-xs font-mono text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>1-Click Auto-Fill:</strong> Instantly populates Act II (Live Execution) from broker fills.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Prop Firm Protection:</strong> Enforces daily loss limits before evaluation accounts blow up.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-trade-emerald shrink-0 mt-0.5" />
                      <span><strong>Local Vault Security:</strong> API keys encrypted locally and sandboxed.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onLaunchTerminal}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-obsidian-highlight hover:bg-slate-700 text-white transition-colors"
                  >
                    <span>Open Broker Vault</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-obsidian-base border border-obsidian-border font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-xs text-white border-b border-obsidian-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-trade-emerald animate-pulse" />
                      <span className="font-bold">TRADOVATE CME STREAM</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">18ms Latency</span>
                  </div>
                  <div className="p-3 rounded-lg bg-obsidian-card border border-obsidian-border/80">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Live Order Fill:</span>
                      <span className="text-trade-emerald font-bold">NQ LONG 2 CTS</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Fill: 20,412.50 | Stop: 20,385.00 | P&L: +$2,620.00
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-trade-emerald/10 border border-trade-emerald/20 text-trade-emerald text-[11px] text-center font-bold">
                    ⚡ 1-Click Import into 3-Act Autopsy Ready
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. PROP TRADERS & FUNDED STANDARDS */}
      <section className="py-20 sm:py-24 bg-obsidian-surface/50 border-b border-obsidian-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered for Prop Firms & Serious Discretionary Traders
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-sans">
              Whether you trade CME Futures evaluations (Apex, Topstep, FTMO) or swing trade tech equities, TradeTale protects your capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-trade-emerald/15 text-trade-emerald flex items-center justify-center font-mono font-bold text-xs">
                  PF
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Funded Prop Trader</h5>
                  <span className="text-[10px] font-mono text-obsidian-slate">Apex / Topstep NQ Futures</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The Drawdown Safety Gate and 1R normalization stopped me from tilting away my 50k funded accounts. Seeing the Discipline Leak in cold cash changed my entire mindset."
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-trade-cyan/15 text-trade-cyan flex items-center justify-center font-mono font-bold text-xs">
                  ST
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Swing & FVG Trader</h5>
                  <span className="text-[10px] font-mono text-obsidian-slate">Equities & Forex</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The Playbook Matrix proved that my Opening Range Breakout setup was mathematically negative expectancy, while my Liquidity Sweeps had an E of +1.8R. Saved me thousands."
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-obsidian-card border border-obsidian-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-trade-amber/15 text-trade-amber flex items-center justify-center font-mono font-bold text-xs">
                  PW
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Mobile PWA Operator</h5>
                  <span className="text-[10px] font-mono text-obsidian-slate">Cross-Platform Web App</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Installs right on my iPhone and iPad as a native app. I can autopsy setups right after market close from the gym with full offline sync."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL-TO-ACTION BANNER */}
      <section className="py-20 sm:py-28 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-trade-emerald/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h3 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Stop Guessing. Start Autopsying With Precision.
          </h3>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-sans">
            Join the traders who separate process discipline from market luck. Launch the terminal right now or create your personalized trading rule set.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchTerminal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-sm font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Live Terminal Now</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-sm font-semibold bg-obsidian-card hover:bg-obsidian-highlight border border-obsidian-border text-slate-200 transition-colors"
            >
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto border-t border-obsidian-border py-8 bg-obsidian-base/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden bg-obsidian-card border border-obsidian-border">
              <img src="/logo.png" alt="TradeTale Logo" className="w-full h-full object-contain" />
            </div>
            <span>TradeTale / Tradestory Empirical Execution Post-Mortem</span>
          </div>
          <div>
            Built with React 19, TypeScript, Tailwind CSS & Firebase
          </div>
        </div>
      </footer>
    </div>
  );
};
