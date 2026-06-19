import { CurrencyCode } from './currency';
import { PlanType } from './plan';

export interface Profile {
  id: string;
  name: string | null;
  currency: CurrencyCode;
  plan: PlanType;
  plan_expires_at: string | null;
  is_admin: boolean;
  created_at: string;
}
