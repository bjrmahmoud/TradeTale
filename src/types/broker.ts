import { AssetClass, TradeDirection } from './trade';

export type BrokerPlatform =
  | 'tradovate'
  | 'ibkr'
  | 'tradestation'
  | 'metatrader'
  | 'ninjatrader';

export type BrokerConnectionStatus =
  | 'connected'
  | 'syncing'
  | 'idle'
  | 'disconnected'
  | 'error';

export interface BrokerConnection {
  id: string;
  userId: string;
  platform: BrokerPlatform;
  displayName: string;
  accountNumber: string;
  environment: 'live' | 'demo';
  status: BrokerConnectionStatus;
  latencyMs: number;
  balance: number;
  unrealizedPnl: number;
  marginAvailable: number;
  currency: string;
  lastSyncTime: string;
  apiKeyMasked?: string;
  errorMessage?: string;
}

export interface BrokerExecution {
  id: string;
  connectionId: string;
  brokerPlatform: BrokerPlatform;
  accountNumber: string;
  ticketId: string;
  instrument: string; // e.g. 'NQ', 'ES', 'TSLA', 'EURUSD'
  assetClass: AssetClass;
  direction: TradeDirection;
  fillPrice: number;
  quantity: number;
  executionTimestamp: string;
  stopPrice?: number;
  targetPrice?: number;
  exitPrice?: number;
  exitTimestamp?: string;
  grossPnl?: number;
  commission: number;
  isImported: boolean; // true if already mapped to a logged trade
}
