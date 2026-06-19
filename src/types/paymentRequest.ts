export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type PlanRequested = 'pro' | 'family';

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_requested: PlanRequested;
  receipt_url: string;
  reference_note: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: { name: string | null; email?: string } | null;
}
