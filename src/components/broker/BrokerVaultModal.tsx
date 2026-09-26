import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BrokerConnection, BrokerExecution, BrokerPlatform } from '../../types/broker';
import { BrokerService } from '../../services/brokerService';

interface BrokerVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExecutionForLogger?: (execution: BrokerExecution) => void;
}

export const BrokerVaultModal: React.FC<BrokerVaultModalProps> = ({
  isOpen,
  onClose,
  onSelectExecutionForLogger,
}) => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [executions, setExecutions] = useState<BrokerExecution[]>([]);
  const [isAddingConnection, setIsAddingConnection] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; ok: boolean } | null>(null);

  // New Connection Form Fields
  const [selectedPlatform, setSelectedPlatform] = useState<BrokerPlatform>('tradovate');
  const [displayName, setDisplayName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [environment, setEnvironment] = useState<'live' | 'demo'>('live');
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConnections(BrokerService.getConnections());
      setExecutions(BrokerService.getExecutions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const newConn = await BrokerService.connectBroker(
        selectedPlatform,
        displayName,
        accountNumber,
        apiKey,
        environment
      );
      setConnections(BrokerService.getConnections());
      setIsAddingConnection(false);
      setDisplayName('');
      setAccountNumber('');
      setApiKey('');
    } catch (err) {
      console.error('Failed to link broker:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleTestConnection = async (connId: string) => {
    setIsTesting(connId);
    setTestResult(null);
    const res = await BrokerService.testConnection(connId);
    setIsTesting(null);
    setTestResult({ id: connId, message: res.message, ok: res.success });
    setConnections(BrokerService.getConnections());
  };

  const handleDisconnect = (connId: string) => {
    BrokerService.disconnectBroker(connId);
    setConnections(BrokerService.getConnections());
  };

  const handleSimulateFill = () => {
    const newExec = BrokerService.simulateNewIncomingFill('NQ');
    setExecutions(BrokerService.getExecutions());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-obsidian-surface border border-obsidian-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-border bg-obsidian-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-trade-emerald/15 border border-trade-emerald/30 text-trade-emerald flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Broker Connection Vault</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-trade-emerald/20 text-trade-emerald border border-trade-emerald/30">
                  REAL-TIME SYNC
                </span>
              </h3>
              <p className="text-xs text-obsidian-slate font-mono">
                Stream live order fills, execution timestamps, and prices straight to 3-Act Autopsy
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Accounts Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Connected Broker Accounts ({connections.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateFill}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-obsidian-card hover:bg-obsidian-highlight border border-trade-cyan/40 text-trade-cyan transition-colors"
                  title="Simulate a new incoming market order fill for testing"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Simulate Live Order Fill</span>
                </button>
                <button
                  onClick={() => setIsAddingConnection(!isAddingConnection)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link New Broker</span>
                </button>
              </div>
            </div>

            {/* Connection Creation Form */}
            {isAddingConnection && (
              <form
                onSubmit={handleConnect}
                className="p-5 rounded-2xl bg-obsidian-card border border-trade-emerald/40 mb-5 space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-obsidian-border pb-2">
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-trade-emerald" /> Link Broker Connection
                  </span>
                  <span className="text-[10px] text-obsidian-slate font-mono">
                    AES-256 Local Encrypted Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Trading Platform
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value as BrokerPlatform)}
                      className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-trade-emerald"
                    >
                      <option value="tradovate">Tradovate (Futures)</option>
                      <option value="ibkr">Interactive Brokers (TWS / Client Portal)</option>
                      <option value="tradestation">TradeStation</option>
                      <option value="metatrader">MetaTrader 5 / Prop Bridge</option>
                      <option value="ninjatrader">NinjaTrader</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Account Nickname
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex 50k #4812"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-trade-emerald"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. APX-9941"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-trade-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      API Token / Secret (Sandbox / Live)
                    </label>
                    <input
                      type="password"
                      placeholder="Paste API Key or Token"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-obsidian-base border border-obsidian-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-trade-emerald"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Environment Tier
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEnvironment('live')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold border ${
                          environment === 'live'
                            ? 'bg-trade-emerald/20 text-trade-emerald border-trade-emerald'
                            : 'bg-obsidian-base text-slate-400 border-obsidian-border'
                        }`}
                      >
                        Live Funded
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvironment('demo')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold border ${
                          environment === 'demo'
                            ? 'bg-trade-cyan/20 text-trade-cyan border-trade-cyan'
                            : 'bg-obsidian-base text-slate-400 border-obsidian-border'
                        }`}
                      >
                        Evaluation / Demo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingConnection(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-trade-emerald hover:bg-emerald-400 text-obsidian-base transition-colors"
                  >
                    {connecting ? 'Authenticating...' : 'Establish Secure Connection'}
                  </button>
                </div>
              </form>
            )}

            {/* Existing Accounts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-4 rounded-xl bg-obsidian-card border border-obsidian-border hover:border-slate-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{conn.displayName}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            conn.environment === 'live'
                              ? 'bg-trade-emerald/15 text-trade-emerald'
                              : 'bg-trade-cyan/15 text-trade-cyan'
                          }`}
                        >
                          {conn.environment}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-obsidian-slate">
                        Acc: {conn.accountNumber} | Platform: {conn.platform.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-trade-emerald animate-pulse" />
                      <span className="text-[11px] font-mono text-trade-emerald font-semibold">
                        {conn.latencyMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-obsidian-base font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">ACCOUNT BALANCE</span>
                      <span className="font-bold text-white">${conn.balance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">MARGIN AVAILABLE</span>
                      <span className="font-bold text-slate-200">${conn.marginAvailable.toLocaleString()}</span>
                    </div>
                  </div>

                  {testResult && testResult.id === conn.id && (
                    <div
                      className={`text-[11px] font-mono p-2 rounded ${
                        testResult.ok
                          ? 'bg-trade-emerald/10 text-trade-emerald border border-trade-emerald/20'
                          : 'bg-trade-rose/10 text-trade-rose'
                      }`}
                    >
                      {testResult.message}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-obsidian-border/50 text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      Sync: {new Date(conn.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestConnection(conn.id)}
                        disabled={isTesting === conn.id}
                        className="px-2.5 py-1 rounded bg-obsidian-base hover:bg-obsidian-highlight text-[11px] font-mono text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <RotateCw className={`w-3 h-3 ${isTesting === conn.id ? 'animate-spin' : ''}`} />
                        <span>Ping</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(conn.id)}
                        className="p-1 text-slate-500 hover:text-trade-rose transition-colors"
                        title="Disconnect Broker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Executions Stream */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Live Broker Order Fills Ready for 3-Act Autopsy
              </h4>
              <span className="text-[11px] font-mono text-obsidian-slate">
                Click any fill to auto-populate into logger
              </span>
            </div>

            <div className="space-y-2">
              {executions.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => {
                    if (onSelectExecutionForLogger) {
                      onSelectExecutionForLogger(exec);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    exec.isImported
                      ? 'bg-obsidian-card/60 border-obsidian-border/60 opacity-60'
                      : 'bg-obsidian-card hover:bg-obsidian-highlight border-obsidian-border hover:border-trade-emerald/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        exec.direction === 'long'
                          ? 'bg-trade-emerald/20 text-trade-emerald'
                          : 'bg-trade-rose/20 text-trade-rose'
                      }`}
                    >
                      {exec.direction.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{exec.instrument}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {exec.quantity} {exec.assetClass === 'futures' ? 'contracts' : 'shares'} @ {exec.fillPrice}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-base text-slate-400">
                          {exec.brokerPlatform.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-obsidian-slate">
                        Filled: {new Date(exec.executionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} | Ticket: {exec.ticketId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {exec.grossPnl !== undefined && (
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-500 block">REALIZED</span>
                        <span
                          className={`text-xs font-bold ${
                            exec.grossPnl >= 0 ? 'text-trade-emerald' : 'text-trade-rose'
                          }`}
                        >
                          {exec.grossPnl >= 0 ? '+' : ''}${exec.grossPnl.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 ${
                        exec.isImported
                          ? 'bg-obsidian-base text-slate-500'
                          : 'bg-trade-emerald hover:bg-emerald-400 text-obsidian-base shadow-sm'
                      }`}
                    >
                      <span>{exec.isImported ? 'Autopsied' : '⚡ Auto-Fill Logger'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-obsidian-border bg-obsidian-card flex items-center justify-between text-xs font-mono text-obsidian-slate">
          <span>Supported: Tradovate, Interactive Brokers, TradeStation, MetaTrader 5</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-obsidian-base hover:bg-obsidian-highlight text-white border border-obsidian-border transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
