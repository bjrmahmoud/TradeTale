import { AssetClass, NeuroState, SessionType } from './trade';

export interface UserTradingRules {
  id: string;
  userId: string;
  tradingStyle: 'scalper' | 'day_trader' | 'swing_trader';
  primaryAssetClass: AssetClass;
  
  // Strategy Used
  primaryStrategies: string[];
  customStrategyName?: string;
  minPlannedRR: number;         // e.g. 2.0 (1:2 R:R)

  // Session Restrictions
  allowedSessions: SessionType[];

  // Number of Trades & Position Sizing
  maxTradesPerDay: number;      // e.g. 3 trades per session
  maxContractsPerTrade: number; // e.g. 2 contracts / lots
  maxRiskPerTradeType: 'percentage' | 'fiat';
  maxRiskPerTradeValue: number; // e.g. 500 ($)
  maxDailyDrawdownR: number;    // e.g. 3.0 (-3R)
  maxDailyDrawdownFiat: number; // e.g. 1500 ($)
  dailyProfitTargetR?: number;  // e.g. 4.0 (+4R)

  // Main Question Asked When Journaling a Trade
  mainJournalingQuestion: string;
  journalingQuestionCategory?: string;

  // Emotional & Structural Defenses
  prohibitedEmotions: NeuroState[];
  structuralStopRequired: boolean;
  noWideningStops: boolean;
  requireCandleCloseConfirmation: boolean;
  
  // Custom checklist items
  customRules: {
    id: string;
    ruleText: string;
    isMandatory: boolean;
  }[];

  isOnboardingCompleted: boolean;
  updatedAt: string;
}

export const DEFAULT_USER_RULES: UserTradingRules = {
  id: 'default_rules',
  userId: 'guest',
  tradingStyle: 'day_trader',
  primaryAssetClass: 'futures',
  primaryStrategies: ['Fair Value Gap (FVG) & Liquidity Sweep', 'Opening Range Breakout (ORB)'],
  customStrategyName: '',
  minPlannedRR: 2.0,
  allowedSessions: ['ny_am', 'ny_pm'],
  maxTradesPerDay: 3,
  maxContractsPerTrade: 2,
  maxRiskPerTradeType: 'fiat',
  maxRiskPerTradeValue: 500,
  maxDailyDrawdownR: 3.0,
  maxDailyDrawdownFiat: 1500,
  dailyProfitTargetR: 4.0,
  mainJournalingQuestion: 'Did I wait for structural confirmation, or did I enter impulsively out of FOMO?',
  journalingQuestionCategory: 'confirmation_vs_fomo',
  prohibitedEmotions: ['fomo_urge', 'revenge_tilted', 'chasing_price'],
  structuralStopRequired: true,
  noWideningStops: true,
  requireCandleCloseConfirmation: true,
  customRules: [
    { id: 'rule-wait-fvg', ruleText: 'Waited for Fair Value Gap / Liquidity sweep confirmation before pulling trigger', isMandatory: true },
    { id: 'rule-hard-stop', ruleText: 'Placed hard stop loss at structural swing level immediately upon fill', isMandatory: true },
    { id: 'rule-max-trades', ruleText: 'Strictly halted trading after reaching maximum session trade count', isMandatory: true },
  ],
  isOnboardingCompleted: false,
  updatedAt: new Date().toISOString(),
};
