import { DEFAULT_USER_RULES, UserTradingRules } from '../types/userRules';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY_USER_RULES = 'tradestory_user_rules_v1';
const FIRESTORE_RULES_COLLECTION = 'user_trading_rules';

export const UserRuleService = {
  getUserRules(userId?: string): UserTradingRules {
    try {
      const key = userId ? `${STORAGE_KEY_USER_RULES}_${userId}` : STORAGE_KEY_USER_RULES;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user rules from storage:', e);
    }
    return DEFAULT_USER_RULES;
  },

  async saveUserRules(rules: UserTradingRules, userId?: string): Promise<boolean> {
    try {
      const effectiveUid = userId || rules.userId || 'guest';
      const key = `${STORAGE_KEY_USER_RULES}_${effectiveUid}`;
      
      const payload: UserTradingRules = {
        ...rules,
        userId: effectiveUid,
        updatedAt: new Date().toISOString(),
      };

      // 1. Save locally for instant offline availability
      localStorage.setItem(key, JSON.stringify(payload));
      localStorage.setItem(STORAGE_KEY_USER_RULES, JSON.stringify(payload));

      // 2. Commit to Firestore if authenticated
      if (effectiveUid !== 'guest' && effectiveUid !== 'demo_guest_trader') {
        try {
          const userRuleDoc = doc(db, FIRESTORE_RULES_COLLECTION, effectiveUid);
          await setDoc(userRuleDoc, payload, { merge: true });
        } catch (cloudErr) {
          console.warn('Firestore user rules sync notice:', cloudErr);
        }
      }

      return true;
    } catch (e) {
      console.error('Failed to save user rules:', e);
      return false;
    }
  },

  async fetchRemoteUserRules(userId: string): Promise<UserTradingRules | null> {
    try {
      if (!userId || userId === 'guest' || userId === 'demo_guest_trader') {
        return this.getUserRules(userId);
      }
      const userRuleDoc = doc(db, FIRESTORE_RULES_COLLECTION, userId);
      const snapshot = await getDoc(userRuleDoc);
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as UserTradingRules;
        this.saveUserRules(remoteData, userId);
        return remoteData;
      }
    } catch (e) {
      console.warn('Could not fetch remote user rules, falling back to local:', e);
    }
    return this.getUserRules(userId);
  },

  hasCompletedOnboarding(userId?: string): boolean {
    const rules = this.getUserRules(userId);
    return rules.isOnboardingCompleted === true;
  },
};
