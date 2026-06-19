import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export function useBudgets(userId: string | undefined) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('category');
    setBudgets(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const upsertBudget = async (category: string, amount: number) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: userId, category, amount },
        { onConflict: 'user_id,category' }
      )
      .select()
      .single();
    if (error) throw error;
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category === category);
      if (idx >= 0) { const next = [...prev]; next[idx] = data; return next; }
      return [...prev, data].sort((a, b) => a.category.localeCompare(b.category));
    });
  };

  const deleteBudget = async (category: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', userId)
      .eq('category', category);
    if (error) throw error;
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  const getBudgetMap = (): Record<string, number> => {
    return Object.fromEntries(budgets.map((b) => [b.category, b.amount]));
  };

  return { budgets, loading, upsertBudget, deleteBudget, getBudgetMap };
}
