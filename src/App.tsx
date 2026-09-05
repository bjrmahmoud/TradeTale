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

function TradestoryApp() {
  const { user, signOutUser } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

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
        setIsLoggerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggerOpen, setIsSearchOpen, setIsLoggerOpen]);

  return (
    <div className="min-h-screen bg-obsidian-base text-slate-100 flex flex-col font-sans">
      {/* Top Command Bar with TT Logo, Risk Gate & Auth Profile */}
      <CommandHeader
        trades={trades}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogger={() => setIsLoggerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onResetDemo={resetToSampleData}
        isCloudSynced={isCloudSynced}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={signOutUser}
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
            onOpenLogger={() => setIsLoggerOpen(true)}
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
        onClose={() => setIsLoggerOpen(false)}
        onSaveTrade={addTrade}
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
        onOpenLogger={() => setIsLoggerOpen(true)}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
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
