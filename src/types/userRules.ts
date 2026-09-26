import { AssetClass, NeuroState, SessionType } from './trade';

export interface UserTradingRules {
  id: string;
  userId: string;
  tradingStyle: 'scalper' | 'day_trader' | 'swing_trader';
  primaryAssetClass: AssetClass;
  
  // Risk Budgeting
  maxRiskPerTradeType: 'percentage' | 'fiat';
  maxRiskPerTradeValue: number; // e.g. 1.0 (%) or 500 ($)
  maxDailyDrawdownR: number;    // e.g. 3.0 (-3R)
  maxDailyDrawdownFiat: number; // e.g. 1500 ($)
  dailyProfitTargetR?: number;  // e.g. 4.0 (+4R)
  maxTradesPerDay: number;      // e.g. 4

  // Session & Time Restrictions
  allowedSessions: SessionType[];

  // Emotional & Psychological Defense
  prohibitedEmotions: NeuroState[];

  // Structural & Golden Execution Rules
  structuralStopRequired: boolean;
  noWideningStops: boolean;
  requireCandleCloseConfirmation: boolean;
  minPlannedRR: number;         // e.g. 2.0 (1:2 R:R)
  
  // Custom checklist items defined by trader
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
  maxRiskPerTradeType: 'fiat',
  maxRiskPerTradeValue: 500,
  maxDailyDrawdownR: 3.0,
  maxDailyDrawdownFiat: 1500,
  dailyProfitTargetR: 4.0,
  maxTradesPerDay: 5,
  allowedSessions: ['ny_am', 'ny_pm'],
  prohibitedEmotions: ['fomo_urge', 'revenge_tilted', 'chasing_price'],
  structuralStopRequired: true,
  noWideningStops: true,
  requireCandleCloseConfirmation: true,
  minPlannedRR: 2.0,
  customRules: [
    { id: 'rule-wait-fvg', ruleText: 'Waited for Fair Value Gap / Liquidity sweep confirmation before pulling trigger', isMandatory: true },
    { id: 'rule-hard-stop', ruleText: 'Placed hard stop loss at structural swing level immediately upon fill', isMandatory: true },
    { id: 'rule-no-chase', ruleText: 'Did not chase market order after 3+ consecutive extended bars', isMandatory: true },
  ],
  isOnboardingCompleted: false,
  updatedAt: new Date().toISOString(),
};
