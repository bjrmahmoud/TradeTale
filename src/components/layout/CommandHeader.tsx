import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Activity, RotateCcw, AlertTriangle, User, LogIn, LogOut } from 'lucide-react';
import { Trade } from '../../types/trade';
import { AuthUser } from '../../types/auth';

interface CommandHeaderProps {
  trades: Trade[];
  activeTab: 'dashboard' | 'autopsy' | 'analytics' | 'playbook';
  setActiveTab: (tab: 'dashboard' | 'autopsy' | 'analytics' | 'playbook') => void;
  onOpenLogger: () => void;
  onOpenSearch: () => void;
  onResetDemo: () => void;
  maxDailyLossR?: number;
  maxDailyLossFiat?: number;
  isCloudSynced?: boolean;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  trades,
  activeTab,
  setActiveTab,
  onOpenLogger,
  onOpenSearch,
  onResetDemo,
  maxDailyLossR = 3.00,
  maxDailyLossFiat = 1500,
  isCloudSynced = true,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' }) + ' EST');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Today's Total R and Net P&L
  const todayTrades = trades.slice(0, 3); // top recent session trades
  const totalDayR = todayTrades.reduce((acc, t) => acc + t.realizedR, 0);
  const totalDayFiat = todayTrades.reduce((acc, t) => acc + t.netPnl, 0);

  // Compute Drawdown Room
  const consumedLossR = totalDayR < 0 ? Math.abs(totalDayR) : 0;
  const drawdownPercent = Math.min(100, (consumedLossR / maxDailyLossR) * 100);
  const isGateWarning = consumedLossR >= maxDailyLossR * 0.65;
  const isGateBreached = consumedLossR >= maxDailyLossR;

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-surface/95 backdrop-blur-md border-b border-obsidian-border select-none">
      {/* Top Warning Banner if Risk Gate Breached */}
      {isGateBreached && (
        <div className="bg-trade-crimson text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>DAILY RISK GATE BREACHED (-{maxDailyLossR.toFixed(2)}R CEILING). TRADE ENTRY LOCK ACTIVATED.</span>
          </div>
          <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded">STEP AWAY FROM DESK</span>
        </div>
      )}

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Session Clock */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom TT Logo uploaded by user */}
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-obsidian-highlight bg-obsidian-base p-0.5 shadow-lg group-hover:border-trade-emerald transition-colors">
              <img
                src="/logo.png"
                alt="Tradestory Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // fallback icon if not yet found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-white tracking-wider text-base">
                  TRADESTORY
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-trade-emerald/15 text-trade-emerald border border-trade-emerald/30">
                  COMMAND
                </span>
              </div>
              <p className="text-[10px] font-mono text-obsidian-slate">EMPIRICAL POST-MORTEM</p>
            </div>
          </div>

          {/* Market Session Pill */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-obsidian-base border border-obsidian-highlight text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trade-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-trade-emerald"></span>
            </span>
            <span className="text-white font-medium">NY AM SESSION</span>
            <span className="text-obsidian-slate">|</span>
            <span className="text-obsidian-slate">{currentTime || '09:45:12 EST'}</span>
          </div>

          {/* Firebase Cloud Sync Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian-base border border-obsidian-highlight text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-trade-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-trade-amber'}`} />
            <span className="text-slate-300">Firebase:</span>
            <span className={isCloudSynced ? 'text-trade-emerald font-semibold' : 'text-trade-amber'}>
              {isCloudSynced ? 'Synced' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-obsidian-base p-1 rounded-lg border border-obsidian-border">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'dashboard'
                ? 'bg-obsidian-highlight text-white font-semibold shadow-sm'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            Daily Pulse
          </button>
          <button
            onClick={() => setActiveTab('autopsy')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'autopsy'
                ? 'bg-obsidian-highlight text-trade-emerald font-semibold shadow-sm'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Trade Autopsy
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'analytics'
                ? 'bg-obsidian-highlight text-white font-semibold shadow-sm'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            Discipline & Edge
          </button>
          <button
            onClick={() => setActiveTab('playbook')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'playbook'
                ? 'bg-obsidian-highlight text-white font-semibold shadow-sm'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            Playbook Matrix
          </button>
        </nav>

        {/* Right: Real-time Risk Gate & Actions */}
        <div className="flex items-center gap-3">
          {/* Daily Drawdown Meter */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-obsidian-base border border-obsidian-highlight rounded-lg">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-obsidian-slate">Session Yield:</span>
              <span
                className={`font-bold tabular-nums ${
                  totalDayR >= 0 ? 'text-trade-emerald' : 'text-trade-crimson'
                }`}
              >
                {totalDayR >= 0 ? '+' : ''}{totalDayR.toFixed(2)}R
              </span>
              <span className="text-[10px] text-obsidian-slate">
                ({totalDayFiat >= 0 ? '+' : ''}${totalDayFiat.toFixed(0)})
              </span>
            </div>
            {/* Mini Progress Bar for Drawdown */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-obsidian-slate">Risk Gate</span>
              <div className="w-24 h-1.5 bg-obsidian-highlight rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isGateBreached
                      ? 'bg-trade-crimson'
                      : isGateWarning
                      ? 'bg-trade-amber'
                      : 'bg-trade-emerald'
                  }`}
                  style={{ width: `${Math.max(8, drawdownPercent)}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-obsidian-slate tabular-nums">
                -{consumedLossR.toFixed(1)} / -{maxDailyLossR.toFixed(1)}R
              </span>
            </div>
          </div>

          {/* Global Search Hotkey Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-obsidian-base hover:bg-obsidian-highlight border border-obsidian-border rounded-lg text-xs font-mono text-obsidian-slate transition-colors"
            title="Global Search (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="text-[10px] bg-obsidian-surface px-1.5 py-0.5 rounded border border-obsidian-highlight">
              ⌘K
            </kbd>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            className="p-2 text-obsidian-slate hover:text-white hover:bg-obsidian-highlight rounded-lg transition-colors"
            title="Reset to Benchmark Sample Trades"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Auth Profile Chip / Sign In Button */}
          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-obsidian-base border border-obsidian-highlight rounded-lg">
              <div className="w-6 h-6 rounded-full bg-trade-emerald/20 text-trade-emerald flex items-center justify-center font-mono text-[11px] font-bold">
                {user.email ? user.email[0].toUpperCase() : 'T'}
              </div>
              <span className="hidden xl:inline-block text-xs font-mono text-slate-200 max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-obsidian-slate hover:text-trade-crimson p-1 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-obsidian-base hover:bg-obsidian-highlight border border-trade-emerald/40 text-trade-emerald transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Action: 3-Act Trade Logger Trigger */}
          <button
            onClick={onOpenLogger}
            disabled={isGateBreached}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shadow-lg ${
              isGateBreached
                ? 'bg-obsidian-border text-obsidian-slate cursor-not-allowed'
                : 'bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-glow-emerald'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Log Trade</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-black/20 px-1.5 py-0.5 rounded ml-1">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
