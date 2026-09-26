import { BrokerConnection, BrokerExecution, BrokerPlatform } from '../types/broker';

const STORAGE_KEY_BROKERS = 'tradestory_broker_connections_v1';
const STORAGE_KEY_EXECUTIONS = 'tradestory_broker_executions_v1';

// Seed sample initial connected broker (Tradovate Demo / Funded Prop)
const DEFAULT_BROKERS: BrokerConnection[] = [
  {
    id: 'conn-tradovate-live',
    userId: 'guest',
    platform: 'tradovate',
    displayName: 'Tradovate CME Futures (Apex Funded #4812)',
    accountNumber: 'APEX-4812-PRO',
    environment: 'live',
    status: 'connected',
    latencyMs: 18,
    balance: 53420.50,
    unrealizedPnl: 0,
    marginAvailable: 49800.00,
    currency: 'USD',
    lastSyncTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    apiKeyMasked: 'trado_live_••••••••90a4',
  },
  {
    id: 'conn-ibkr-paper',
    userId: 'guest',
    platform: 'ibkr',
    displayName: 'Interactive Brokers (Pro Equities)',
    accountNumber: 'U8923412',
    environment: 'demo',
    status: 'idle',
    latencyMs: 34,
    balance: 102450.00,
    unrealizedPnl: 0,
    marginAvailable: 95000.00,
    currency: 'USD',
    lastSyncTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    apiKeyMasked: 'ibkr_sec_••••••••11bc',
  },
];

// Seed recent live executions ready to be imported into logger
const DEFAULT_EXECUTIONS: BrokerExecution[] = [
  {
    id: 'exec-nq-fresh',
    connectionId: 'conn-tradovate-live',
    brokerPlatform: 'tradovate',
    accountNumber: 'APEX-4812-PRO',
    ticketId: 'TRD-994821',
    instrument: 'NQ',
    assetClass: 'futures',
    direction: 'long',
    fillPrice: 20412.50,
    quantity: 2,
    executionTimestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    stopPrice: 20385.00,
    targetPrice: 20480.00,
    exitPrice: 20478.00,
    exitTimestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    grossPnl: 2620.00,
    commission: 8.40,
    isImported: false,
  },
  {
    id: 'exec-es-morning',
    connectionId: 'conn-tradovate-live',
    brokerPlatform: 'tradovate',
    accountNumber: 'APEX-4812-PRO',
    ticketId: 'TRD-994109',
    instrument: 'ES',
    assetClass: 'futures',
    direction: 'short',
    fillPrice: 5784.75,
    quantity: 1,
    executionTimestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    stopPrice: 5792.00,
    targetPrice: 5765.00,
    exitPrice: 5768.25,
    exitTimestamp: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    grossPnl: 825.00,
    commission: 4.20,
    isImported: false,
  },
  {
    id: 'exec-tsla-breakout',
    connectionId: 'conn-ibkr-paper',
    brokerPlatform: 'ibkr',
    accountNumber: 'U8923412',
    ticketId: 'IB-4410294',
    instrument: 'TSLA',
    assetClass: 'equities',
    direction: 'long',
    fillPrice: 242.15,
    quantity: 150,
    executionTimestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    stopPrice: 238.50,
    targetPrice: 251.00,
    exitPrice: 249.80,
    exitTimestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    grossPnl: 1147.50,
    commission: 2.00,
    isImported: false,
  },
];

export const BrokerService = {
  getConnections(): BrokerConnection[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BROKERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load broker connections:', e);
    }
    return DEFAULT_BROKERS;
  },

  saveConnections(connections: BrokerConnection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BROKERS, JSON.stringify(connections));
    } catch (e) {
      console.error('Failed to save broker connections:', e);
    }
  },

  getExecutions(): BrokerExecution[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXECUTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load broker executions:', e);
    }
    return DEFAULT_EXECUTIONS;
  },

  saveExecutions(executions: BrokerExecution[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_EXECUTIONS, JSON.stringify(executions));
    } catch (e) {
      console.error('Failed to save broker executions:', e);
    }
  },

  async connectBroker(
    platform: BrokerPlatform,
    displayName: string,
    accountNumber: string,
    apiKey: string,
    environment: 'live' | 'demo' = 'live'
  ): Promise<BrokerConnection> {
    // Simulate API authorization handshake with latency
    await new Promise((r) => setTimeout(r, 900));

    const connections = this.getConnections();
    const newConnection: BrokerConnection = {
      id: `conn-${platform}-${Date.now()}`,
      userId: 'current_user',
      platform,
      displayName: displayName || `${platform.toUpperCase()} Account`,
      accountNumber: accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      environment,
      status: 'connected',
      latencyMs: Math.floor(12 + Math.random() * 25),
      balance: environment === 'live' ? 50000.00 : 100000.00,
      unrealizedPnl: 0,
      marginAvailable: environment === 'live' ? 47500.00 : 95000.00,
      currency: 'USD',
      lastSyncTime: new Date().toISOString(),
      apiKeyMasked: `${platform}_${apiKey ? apiKey.substring(0, 4) : 'key'}••••••••`,
    };

    const updated = [newConnection, ...connections];
    this.saveConnections(updated);
    return newConnection;
  },

  disconnectBroker(connectionId: string): void {
    const connections = this.getConnections();
    const filtered = connections.filter((c) => c.id !== connectionId);
    this.saveConnections(filtered);
  },

  async testConnection(connectionId: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const connections = this.getConnections();
    const conn = connections.find((c) => c.id === connectionId);
    if (!conn) {
      return { success: false, latencyMs: 0, message: 'Broker connection not found' };
    }

    const latency = Math.floor(14 + Math.random() * 20);
    conn.latencyMs = latency;
    conn.status = 'connected';
    conn.lastSyncTime = new Date().toISOString();
    this.saveConnections(connections);

    return {
      success: true,
      latencyMs: latency,
      message: `WebSocket handshake OK (${latency}ms). Stream active for ${conn.displayName}.`,
    };
  },

  markExecutionAsImported(executionId: string): void {
    const executions = this.getExecutions();
    const target = executions.find((e) => e.id === executionId);
    if (target) {
      target.isImported = true;
      this.saveExecutions(executions);
    }
  },

  simulateNewIncomingFill(instrument: string = 'NQ'): BrokerExecution {
    const connections = this.getConnections();
    const primary = connections[0] || DEFAULT_BROKERS[0];

    const isLong = Math.random() > 0.4;
    const basePrice = instrument === 'NQ' ? 20420.00 : instrument === 'ES' ? 5790.00 : 245.00;
    const offset = (Math.random() * 8 - 4);
    const fillPrice = Number((basePrice + offset).toFixed(2));
    const isWin = Math.random() > 0.35;
    const rMove = isWin ? (Math.random() * 40 + 20) : -(Math.random() * 25 + 10);
    const exitPrice = Number((isLong ? fillPrice + rMove : fillPrice - rMove).toFixed(2));
    const mult = instrument === 'NQ' ? 20 : instrument === 'ES' ? 50 : 1;
    const qty = 2;
    const pnl = Number(((exitPrice - fillPrice) * (isLong ? 1 : -1) * mult * qty).toFixed(2));

    const newExec: BrokerExecution = {
      id: `exec-${Date.now()}`,
      connectionId: primary.id,
      brokerPlatform: primary.platform,
      accountNumber: primary.accountNumber,
      ticketId: `TRD-${Math.floor(100000 + Math.random() * 900000)}`,
      instrument,
      assetClass: instrument === 'TSLA' ? 'equities' : 'futures',
      direction: isLong ? 'long' : 'short',
      fillPrice,
      quantity: qty,
      executionTimestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      stopPrice: Number((isLong ? fillPrice - 25 : fillPrice + 25).toFixed(2)),
      targetPrice: Number((isLong ? fillPrice + 60 : fillPrice - 60).toFixed(2)),
      exitPrice,
      exitTimestamp: new Date().toISOString(),
      grossPnl: pnl,
      commission: 8.40,
      isImported: false,
    };

    const executions = [newExec, ...this.getExecutions()];
    this.saveExecutions(executions);
    return newExec;
  },
};
