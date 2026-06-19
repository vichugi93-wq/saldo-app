import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';
import { CurrencyCode } from '../types/currency';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.error('[useAuth] Error al cargar perfil:', error.message, error.code);
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        currency: 'PYG',
        plan: 'pro',
        plan_expires_at: expiresAt.toISOString(),
        is_admin: false,
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'name' | 'currency'>>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data as Profile);
  };

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const isValidPlan = (): boolean => {
    if (!profile) return false;
    if (profile.plan === 'basic') return true;
    if (!profile.plan_expires_at) return false;
    return new Date(profile.plan_expires_at) > new Date();
  };

  const effectivePlan = (): Profile['plan'] => {
    if (!profile) return 'basic';
    if (profile.plan === 'basic') return 'basic';
    if (!isValidPlan()) return 'basic';
    return profile.plan;
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    isValidPlan,
    effectivePlan,
    currency: (profile?.currency ?? 'PYG') as CurrencyCode,
  };
}
