import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentRequest, PlanRequested } from '../types/paymentRequest';

export function usePaymentRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setRequests((data as PaymentRequest[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (
    planRequested: PlanRequested,
    receiptFile: File,
    referenceNote?: string,
  ) => {
    if (!userId) throw new Error('No user');

    const ext = receiptFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(path, receiptFile, { contentType: receiptFile.type });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(path);

    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        plan_requested: planRequested,
        receipt_url: publicUrl,
        reference_note: referenceNote ?? null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    setRequests((prev) => [data as PaymentRequest, ...prev]);
    return data as PaymentRequest;
  };

  const pendingRequest = requests.find((r) => r.status === 'pending') ?? null;

  return {
    requests,
    pendingRequest,
    loading,
    createRequest,
    refetch: fetchRequests,
  };
}
