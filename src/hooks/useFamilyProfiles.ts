import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CurrencyCode } from '../types/currency';

export interface FamilyProfile {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  currency: CurrencyCode;
  created_at: string;
}

interface CreateFamilyProfileInput {
  name: string;
  color: string;
  currency: CurrencyCode;
}

export function useFamilyProfiles(userId: string | undefined) {
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    setFamilyProfiles((data as FamilyProfile[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const createProfile = async (input: CreateFamilyProfileInput) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('family_profiles')
      .insert({ ...input, owner_id: userId })
      .select()
      .single();
    if (error) throw error;
    setFamilyProfiles((prev) => [...prev, data as FamilyProfile]);
  };

  const updateProfile = async (id: string, updates: Partial<CreateFamilyProfileInput>) => {
    const { data, error } = await supabase
      .from('family_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setFamilyProfiles((prev) => prev.map((p) => (p.id === id ? (data as FamilyProfile) : p)));
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from('family_profiles').delete().eq('id', id);
    if (error) throw error;
    setFamilyProfiles((prev) => prev.filter((p) => p.id !== id));
    if (selectedProfileId === id) setSelectedProfileId(null);
  };

  const selectedProfile = familyProfiles.find((p) => p.id === selectedProfileId) ?? null;

  return {
    familyProfiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: fetchProfiles,
  };
}
