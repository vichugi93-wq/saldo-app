import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Goal } from '../types/goal';

interface CreateGoalInput {
  name: string;
  target_amount: number;
  deadline?: string;
  category?: string;
}

export function useSavingsGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = async (input: CreateGoalInput) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...input, user_id: userId, current_amount: 0, status: 'active' })
      .select()
      .single();
    if (error) throw error;
    setGoals((prev) => [data as Goal, ...prev]);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
    const status = newAmount >= goal.target_amount ? 'completed' : 'active';
    await updateGoal(id, { current_amount: newAmount, status });
  };

  const activeGoals = goals.filter((g) => g.status === 'active');

  return {
    goals,
    activeGoals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    refetch: fetchGoals,
  };
}
