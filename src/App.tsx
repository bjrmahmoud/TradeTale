import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTradeStore } from './stores/tradeStore';
import { CommandHeader } from './components/layout/CommandHeader';
import { DailyPulseDashboard } from './components/dashboard/DailyPulseDashboard';
import { TradeAutopsyView } from './components/autopsy/TradeAutopsyView';
import { DisciplineAnalyticsView } from './components/analytics/DisciplineAnalyticsView';
import { PlaybookMatrixView } from './components/playbook/PlaybookMatrixView';
import { StreamlinedTradeLoggerModal } from './components/logger/StreamlinedTradeLoggerModal';
import { GlobalCommandDialog } from './components/search/GlobalCommandDialog';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';
import { BrokerVaultModal } from './components/broker/BrokerVaultModal';
import { UserRuleService } from './services/userRuleService';
import { UserTradingRules, DEFAULT_USER_RULES } from './types/userRules';
import { BrokerExecution } from './types/broker';
import { AuthMode } from './types/auth';

function TradestoryApp() {
  const { user, signOutUser } = useAuth();
  
  // High-level navigation state: Landing presentation page vs Live terminal
  const [viewMode, setViewMode] = useState<'landing' | 'terminal'>('terminal');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>('signin');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isBrokerVaultOpen, setIsBrokerVaultOpen] = useState<boolean>(false);
  const [activeBrokerExecution, setActiveBrokerExecution] = useState<BrokerExecution | null>(null);

  // User Trading Rules & Governance
  const [userRules, setUserRules] = useState<UserTradingRules>(() =>
    UserRuleService.getUserRules(user?.uid)
  );

  const {
    trades,
    selectedTradeId,
    setSelectedTradeId,
    selectedTrade,
    activeTab,
    setActiveTab,
    isLoggerOpen,
    setIsLoggerOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCloudSynced,
    addTrade,
    updateTrade,
    resetToSampleData,
    updateChartImage,
  } = useTradeStore(user);

  // Sync user rules when user identity changes
  useEffect(() => {
    if (user?.uid) {
      UserRuleService.fetchRemoteUserRules(user.uid).then((remoteRules) => {
        if (remoteRules) setUserRules(remoteRules);
      });
    }
  }, [user]);

  // Global Keyboard Shortcuts (N for New Trade, Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key.toLowerCase() === 'n' && !isLoggerOpen) {
        e.preventDefault();
        setActiveBrokerExecution(null);
        setIsLoggerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggerOpen, setIsSearchOpen, setIsLoggerOpen]);

  // If in Landing Mode, render the high-conversion Landing Page
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-obsidian-base text-slate-100 flex flex-col font-sans">
        <LandingPage
          onLaunchTerminal={() => setViewMode('terminal')}
          onOpenLogin={() => {
            setAuthInitialMode('signin');
            setIsAuthOpen(true);
          }}
          onOpenRegister={() => {
            setAuthInitialMode('signup');
            setIsAuthOpen(true);
          }}
        />

        {/* Auth Modal callable from Landing */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authInitialMode}
          onClose={() => setIsAuthOpen(false)}
          onRegisterSuccess={() => {
            setViewMode('terminal');
            setIsOnboardingOpen(true);
          }}
        />
      </div>
    );
  }

  // Terminal (App) View
  return (
    <div className="min-h-screen bg-obsidian-base text-slate-100 flex flex-col font-sans">
      {/* Top Command Bar with TT Logo, Risk Gate & Controls */}
      <CommandHeader
        trades={trades}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogger={() => {
          setActiveBrokerExecution(null);
          setIsLoggerOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onResetDemo={resetToSampleData}
        maxDailyLossR={userRules.maxDailyDrawdownR}
        maxDailyLossFiat={userRules.maxDailyDrawdownFiat}
        isCloudSynced={isCloudSynced}
        user={user}
        onOpenAuth={() => {
          setAuthInitialMode('signin');
          setIsAuthOpen(true);
        }}
        onSignOut={signOutUser}
        onOpenRules={() => setIsOnboardingOpen(true)}
        onOpenBrokerVault={() => setIsBrokerVaultOpen(true)}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DailyPulseDashboard
            trades={trades}
            onSelectTrade={(id) => {
              setSelectedTradeId(id);
              setActiveTab('autopsy');
            }}
            onOpenLogger={() => {
              setActiveBrokerExecution(null);
              setIsLoggerOpen(true);
            }}
          />
        )}

        {activeTab === 'autopsy' && (
          <TradeAutopsyView
            trade={selectedTrade}
            allTrades={trades}
            onSelectTrade={(id) => setSelectedTradeId(id)}
            onUpdateTrade={updateTrade}
            onUpdateChart={(slot, imageUrl) => updateChartImage(selectedTrade.id, slot, imageUrl)}
            onBackToPulse={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'analytics' && (
          <DisciplineAnalyticsView trades={trades} />
        )}

        {activeTab === 'playbook' && (
          <PlaybookMatrixView trades={trades} />
        )}
      </main>

      {/* Streamlined 2-Step Visual Trade Logger Modal */}
      <StreamlinedTradeLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => {
          setIsLoggerOpen(false);
          setActiveBrokerExecution(null);
        }}
        onSaveTrade={addTrade}
        initialExecution={activeBrokerExecution}
      />

      {/* Cmd+K Global Command Search Palette */}
      <GlobalCommandDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        trades={trades}
        onSelectTrade={(id) => {
          setSelectedTradeId(id);
          setActiveTab('autopsy');
        }}
        onOpenLogger={() => {
          setActiveBrokerExecution(null);
          setIsLoggerOpen(true);
        }}
      />

      {/* First-Time User Onboarding & Dynamic Rule Builder */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userId={user?.uid}
        onRulesSaved={(newRules) => setUserRules(newRules)}
      />

      {/* Real-Time Broker Access & Connection Vault */}
      <BrokerVaultModal
        isOpen={isBrokerVaultOpen}
        onClose={() => setIsBrokerVaultOpen(false)}
        onSelectExecutionForLogger={(exec) => {
          setActiveBrokerExecution(exec);
          setIsLoggerOpen(true);
        }}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
        onRegisterSuccess={() => {
          setIsOnboardingOpen(true);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TradestoryApp />
    </AuthProvider>
  );
}

export default App;
