export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  status: GoalStatus;
  created_at: string;
}
