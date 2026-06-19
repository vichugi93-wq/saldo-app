import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionType, TransactionCategory } from '../types/transaction';
import { monthStartISO, monthEndISO } from '../utils/formatters';

interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description?: string;
  date: string;
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setTransactions((data as Transaction[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const createTransaction = async (input: CreateTransactionInput) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    setTransactions((prev) => [data as Transaction, ...prev]);
    return data as Transaction;
  };

  const updateTransaction = async (id: string, input: Partial<CreateTransactionInput>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTransactions((prev) => prev.map((t) => (t.id === id ? (data as Transaction) : t)));
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const monthlyTransactions = (date = new Date()) =>
    transactions.filter((t) => t.date >= monthStartISO(date) && t.date <= monthEndISO(date));

  const monthlyCount = (date = new Date()) => monthlyTransactions(date).length;

  const monthlyTotals = (date = new Date()) => {
    const monthly = monthlyTransactions(date);
    const income = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  };

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    monthlyTransactions,
    monthlyCount,
    monthlyTotals,
    refetch: fetchTransactions,
  };
}
