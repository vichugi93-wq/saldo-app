import { Profile } from '../types/profile';
import { PlanType, PLAN_FEATURES } from '../types/plan';

export function usePlan(profile: Profile | null, overridePlan?: PlanType) {
  const now = new Date();

  const isExpired = (): boolean => {
    if (!profile || profile.plan === 'basic') return false;
    if (!profile.plan_expires_at) return true;
    return new Date(profile.plan_expires_at) <= now;
  };

  const effectivePlan = (): PlanType => {
    if (!profile) return 'basic';
    if (overridePlan) return overridePlan;
    if (profile.plan === 'basic') return 'basic';
    if (isExpired()) return 'basic';
    return profile.plan;
  };

  const plan = effectivePlan();
  const features = PLAN_FEATURES[plan];

  const daysUntilExpiry = (): number | null => {
    if (!profile?.plan_expires_at || profile.plan === 'basic') return null;
    const diff = new Date(profile.plan_expires_at).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isPro = plan === 'pro' || plan === 'family';
  const isFamily = plan === 'family';
  const days = daysUntilExpiry();
  const expiresSOon = days !== null && days <= 5 && days > 0;

  return {
    plan,
    features,
    isPro,
    isFamily,
    isExpired: isExpired(),
    daysUntilExpiry: days,
    expiresSOon,
    canUseAI: features.aiAnalysis,
    canExport: features.exportReports,
    canUseAdvancedCharts: features.advancedCharts,
    canUseFamilyProfiles: features.familyProfiles,
    maxGoals: features.maxActiveGoals,
    maxMonthlyTransactions: features.maxTransactionsPerMonth,
  };
}
