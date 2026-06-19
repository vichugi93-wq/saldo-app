export type PlanType = 'basic' | 'pro' | 'family';

export interface PlanFeatures {
  maxTransactionsPerMonth: number | null;
  maxActiveGoals: number | null;
  aiAnalysis: boolean;
  advancedCharts: boolean;
  exportReports: boolean;
  familyProfiles: boolean;
  maxFamilyProfiles: number | null;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  basic: {
    maxTransactionsPerMonth: 50,
    maxActiveGoals: 1,
    aiAnalysis: false,
    advancedCharts: false,
    exportReports: false,
    familyProfiles: false,
    maxFamilyProfiles: null,
  },
  pro: {
    maxTransactionsPerMonth: null,
    maxActiveGoals: null,
    aiAnalysis: true,
    advancedCharts: true,
    exportReports: true,
    familyProfiles: false,
    maxFamilyProfiles: null,
  },
  family: {
    maxTransactionsPerMonth: null,
    maxActiveGoals: null,
    aiAnalysis: true,
    advancedCharts: true,
    exportReports: true,
    familyProfiles: true,
    maxFamilyProfiles: 4,
  },
};

export const PLAN_PRICES: Record<Exclude<PlanType, 'basic'>, number> = {
  pro: 4,
  family: 8,
};

export const PLAN_LABELS: Record<PlanType, string> = {
  basic: 'Básico',
  pro: 'Pro',
  family: 'Familiar',
};
