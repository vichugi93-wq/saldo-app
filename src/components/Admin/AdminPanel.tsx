import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { PaymentRequest, PaymentStatus } from '../../types/paymentRequest';
import { PaymentRequestCard } from './PaymentRequestCard';
import { AdminStats } from './AdminStats';

interface Props {
  adminId: string;
}

type FilterType = 'all' | PaymentStatus;

export function AdminPanel({ adminId }: Props) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('pending');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payment_requests')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    setRequests((data as PaymentRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'approved', label: 'Aprobadas' },
    { key: 'rejected', label: 'Rechazadas' },
    { key: 'all', label: 'Todas' },
  ];

  return (
    <div className="space-y-5 fade-in">
      <h2 className="text-white font-bold text-lg">Panel de administración</h2>

      <AdminStats />

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === key ? 'border-income text-income' : 'border-border text-muted hover:text-white'
            }`}
          >
            {label}
            {key !== 'all' && ` (${requests.filter((r) => r.status === key).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-border rounded w-3/4 mb-2" />
              <div className="h-3 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted text-sm">Sin solicitudes en este filtro</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <PaymentRequestCard
              key={r.id}
              request={r}
              adminId={adminId}
              onUpdated={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
