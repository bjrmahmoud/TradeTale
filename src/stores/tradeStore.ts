import { useState, useEffect } from 'react';
import { Trade } from '../types/trade';
import { AuthUser } from '../types/auth';
import { INITIAL_TRADES } from '../lib/constants';
import {
  subscribeToUserTrades,
  saveTradeToFirestore,
  updateTradeInFirestore,
  deleteTradeFromFirestore,
  uploadChartToFirebaseStorage,
} from '../services/tradeService';

const STORAGE_KEY = 'tradestory_trades_v2';

export function useTradeStore(user: AuthUser | null) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load trades from local storage', e);
    }
    return INITIAL_TRADES;
  });

  const [selectedTradeId, setSelectedTradeId] = useState<string>(INITIAL_TRADES[0].id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'autopsy' | 'analytics' | 'playbook'>('dashboard');
  const [isLoggerOpen, setIsLoggerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Sync with Firestore whenever user changes
  useEffect(() => {
    if (!user) {
      setIsCloudSynced(false);
      return;
    }

    const effectiveUid = user.uid;
    console.log(`Subscribing to Firestore trades for user: ${effectiveUid}`);

    const unsubscribe = subscribeToUserTrades(
      effectiveUid,
      (remoteTrades) => {
        if (remoteTrades && remoteTrades.length > 0) {
          setTrades(remoteTrades);
          if (!remoteTrades.some((t) => t.id === selectedTradeId)) {
            setSelectedTradeId(remoteTrades[0].id);
          }
          setIsCloudSynced(true);
        }
      },
      () => {
        setIsCloudSynced(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Sync to local storage as continuous fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (e) {
      console.error('Failed to persist trades', e);
    }
  }, [trades]);

  const addTrade = async (trade: Trade) => {
    // 1. Optimistic local update
    setTrades((prev) => [trade, ...prev]);
    setSelectedTradeId(trade.id);
    setActiveTab('autopsy');

    // 2. Commit to Cloud Firestore
    const uid = user ? user.uid : 'guest_trader';
    await saveTradeToFirestore(uid, trade);
    setIsCloudSynced(true);
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    // 1. Local update
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // 2. Sync to Firestore
    await updateTradeInFirestore(id, updates);
  };

  const deleteTrade = async (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    if (selectedTradeId === id && trades.length > 1) {
      const remaining = trades.filter((t) => t.id !== id);
      setSelectedTradeId(remaining[0].id);
    }

    await deleteTradeFromFirestore(id);
  };

  const resetToSampleData = async () => {
    setTrades(INITIAL_TRADES);
    setSelectedTradeId(INITIAL_TRADES[0].id);
    localStorage.removeItem(STORAGE_KEY);

    const uid = user ? user.uid : 'guest_trader';
    for (const trade of INITIAL_TRADES) {
      await saveTradeToFirestore(uid, trade);
    }
  };

  const updateChartImage = async (tradeId: string, slot: 'pre' | 'post', imageUrl: string) => {
    // 1. Optimistic update
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id !== tradeId) return t;
        return slot === 'pre'
          ? { ...t, preChartUrl: imageUrl }
          : { ...t, postChartUrl: imageUrl };
      })
    );

    // 2. Upload to Cloud Storage in background
    if (imageUrl.startsWith('data:')) {
      const uid = user ? user.uid : 'guest_trader';
      const cloudUrl = await uploadChartToFirebaseStorage(uid, tradeId, slot, imageUrl);
      if (cloudUrl && cloudUrl !== imageUrl) {
        setTrades((prev) =>
          prev.map((t) => {
            if (t.id !== tradeId) return t;
            return slot === 'pre'
              ? { ...t, preChartUrl: cloudUrl }
              : { ...t, postChartUrl: cloudUrl };
          })
        );
        await updateTradeInFirestore(tradeId, slot === 'pre' ? { preChartUrl: cloudUrl } : { postChartUrl: cloudUrl });
      }
    }
  };

  const selectedTrade = trades.find((t) => t.id === selectedTradeId) || trades[0];

  return {
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
    deleteTrade,
    resetToSampleData,
    updateChartImage,
  };
}
