import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FamilyGroup {
  id: string;
  owner_id: string;
  max_members: number;
  created_at: string;
}

export interface FamilyInvitation {
  id: string;
  group_id: string;
  invited_email: string;
  token: string;
  status: 'pending' | 'accepted' | 'cancelled';
  invited_user_id: string | null;
  created_at: string;
  expires_at: string;
}

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function useFamilyGroup(userId: string | undefined) {
  const [ownedGroup, setOwnedGroup]     = useState<FamilyGroup | null>(null);
  const [invitations, setInvitations]   = useState<FamilyInvitation[]>([]);
  const [memberOfGroup, setMemberOfGroup] = useState<FamilyGroup | null>(null);
  const [ownerName, setOwnerName]       = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    // ¿El usuario es titular de un grupo?
    const { data: group } = await supabase
      .from('family_groups')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (group) {
      setOwnedGroup(group);
      const { data: invites } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('group_id', group.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });
      setInvitations(invites ?? []);
    } else {
      setOwnedGroup(null);
      setInvitations([]);
    }

    // ¿El usuario es miembro de un grupo ajeno?
    const { data: profile } = await supabase
      .from('profiles')
      .select('family_group_id')
      .eq('id', userId)
      .single();

    if (profile?.family_group_id && !group) {
      const { data: memberGroup } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', profile.family_group_id)
        .maybeSingle();
      setMemberOfGroup(memberGroup ?? null);

      if (memberGroup) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', memberGroup.owner_id)
          .single();
        setOwnerName(ownerProfile?.name ?? null);
      }
    } else {
      setMemberOfGroup(null);
      setOwnerName(null);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Crear grupo si no existe y devuelve el grupo
  const ensureGroup = async (): Promise<FamilyGroup> => {
    if (ownedGroup) return ownedGroup;
    const { data, error } = await supabase
      .from('family_groups')
      .insert({ owner_id: userId })
      .select()
      .single();
    if (error) throw error;
    setOwnedGroup(data);
    return data;
  };

  const inviteMember = async (email: string) => {
    const group = await ensureGroup();
    const token = generateToken();
    const { data, error } = await supabase
      .from('family_invitations')
      .insert({ group_id: group.id, invited_email: email.trim().toLowerCase(), token })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('Ya existe una invitación para ese email.');
      throw error;
    }
    setInvitations((prev) => [data, ...prev]);
    return data as FamilyInvitation;
  };

  const cancelInvitation = async (invitationId: string) => {
    await supabase
      .from('family_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);
    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  const removeMember = async (invitationId: string, memberId: string) => {
    await supabase.from('family_invitations').update({ status: 'cancelled' }).eq('id', invitationId);
    await supabase.from('profiles').update({ family_group_id: null, plan: 'basic', plan_expires_at: null }).eq('id', memberId);
    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  const acceptInvitation = async (token: string): Promise<void> => {
    if (!userId) throw new Error('No autenticado');

    const { data: invite, error } = await supabase
      .from('family_invitations')
      .select('*, family_groups(*)')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle();

    if (error || !invite) throw new Error('Invitación inválida o ya usada.');
    if (new Date(invite.expires_at) < new Date()) throw new Error('La invitación expiró. Pedí que te envíen una nueva.');

    // Obtener plan del titular para copiarlo al miembro
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at')
      .eq('id', (invite.family_groups as FamilyGroup).owner_id)
      .single();

    await supabase
      .from('family_invitations')
      .update({ status: 'accepted', invited_user_id: userId })
      .eq('id', invite.id);

    await supabase
      .from('profiles')
      .update({
        family_group_id: invite.group_id,
        plan: 'pro',
        plan_expires_at: ownerProfile?.plan_expires_at ?? null,
      })
      .eq('id', userId);
  };

  const leaveGroup = async () => {
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ family_group_id: null, plan: 'basic', plan_expires_at: null })
      .eq('id', userId);
    setMemberOfGroup(null);
    setOwnerName(null);
  };

  const activeInvitations = invitations.filter((i) => i.status !== 'cancelled');
  const usedSlots  = activeInvitations.length;
  const maxGuests  = (ownedGroup?.max_members ?? 4) - 1;
  const freeSlots  = maxGuests - usedSlots;

  return {
    ownedGroup,
    invitations: activeInvitations,
    memberOfGroup,
    ownerName,
    loading,
    usedSlots,
    maxGuests,
    freeSlots,
    inviteMember,
    cancelInvitation,
    removeMember,
    acceptInvitation,
    leaveGroup,
    refetch: fetch,
  };
}
