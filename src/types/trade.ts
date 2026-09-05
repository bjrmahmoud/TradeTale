export type AssetClass = 'futures' | 'forex' | 'equities' | 'crypto';
export type TradeDirection = 'long' | 'short';
export type NeuroState = 'calm_centered' | 'fomo_urge' | 'hesitant' | 'chasing_price' | 'revenge_tilted';
export type SessionType = 'asia' | 'london' | 'ny_am' | 'ny_lunch' | 'ny_pm';
export type MistakeCategory = 'entry' | 'risk_management' | 'exit' | 'psychology';
export type LeakSeverity = 'minor' | 'moderate' | 'severe' | 'catastrophic';

export interface MistakeDefinition {
  id: string;
  category: MistakeCategory;
  code: string;
  label: string;
  description: string;
  isSystemDefault: boolean;
}

export interface TradeMistake {
  mistakeId: string;
  code: string;
  label: string;
  category: MistakeCategory;
  severity: LeakSeverity;
  costOfMistakeR: number;     // Capital leaked in units of R
  costOfMistakeFiat: number;  // Capital leaked in fiat dollars
  triggerEmotion: string;
  ruleTakeaway: string;
}

export interface TradeRule {
  id: string;
  ruleText: string;
  isMandatory: boolean;
  weight: number;
}

export interface RuleResponse {
  ruleId: string;
  ruleText: string;
  passed: boolean;
}

export interface Trade {
  id: string;
  accountName: string;
  setupName: string;

  // Act I: The Thesis
  instrument: string; // e.g. 'NQ', 'ES', 'NVDA', 'EUR/USD'
  assetClass: AssetClass;
  direction: TradeDirection;
  session: SessionType;
  anchorTimeframe: string;
  executionTimeframe: string;
  plannedEntry: number;
  plannedStop: number;
  plannedTarget: number;
  plannedRR: number;
  preChartUrl: string;
  thesisNotes: string;

  // Act II: Live Execution
  executedEntry: number;
  executedStop: number;
  positionSize: number; // contracts / shares / lots
  entryTimestamp: string;
  neuroState: NeuroState;
  slippageOffset: number; // executedEntry - plannedEntry

  // Act III: Outcome & Autopsy
  executedExit: number;
  exitTimestamp: string;
  grossPnl: number;
  commissionFees: number;
  netPnl: number;
  postChartUrl: string;

  // 3-Line Post-Mortem Narrative
  narrativeWorked: string;
  narrativeFailed: string;
  narrativeLesson: string;

  // Quantitative Risk Normalization
  initialRiskDollars: number; // 1R denominator
  realizedR: number;          // netPnl / initialRiskDollars

  // Compliance & Mistake Attribution
  isFullyCompliant: boolean;
  ruleResponses: RuleResponse[];
  mistakes: TradeMistake[];
  
  createdAt: string;
}

export interface PlaybookSetup {
  id: string;
  name: string;
  description: string;
  targetRR: number;
  winRate: number;
  totalTrades: number;
  expectancyR: number;
  isRetired: boolean;
}

export interface DailySessionSummary {
  date: string;
  tradesCount: number;
  totalRealizedR: number;
  totalNetPnl: number;
  adherenceRate: number;
  isCompliantDay: boolean;
}
