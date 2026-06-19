import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  byPlan: Record<string, number>;
  pendingRequests: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, byPlan: {}, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ count: total }, { data: plans }, { count: pending }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('plan'),
        supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      const byPlan: Record<string, number> = {};
      plans?.forEach((p: { plan: string }) => { byPlan[p.plan] = (byPlan[p.plan] ?? 0) + 1; });
      setStats({ totalUsers: total ?? 0, byPlan, pendingRequests: pending ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-muted text-sm">Cargando estadísticas...</div>;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="card">
        <p className="text-muted text-xs mb-1">Usuarios totales</p>
        <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
      </div>
      <div className="card border-goal/50">
        <p className="text-muted text-xs mb-1">Pagos pendientes</p>
        <p className="text-2xl font-bold text-goal">{stats.pendingRequests}</p>
      </div>
      {Object.entries(stats.byPlan).map(([plan, count]) => (
        <div key={plan} className="card">
          <p className="text-muted text-xs mb-1 capitalize">Plan {plan}</p>
          <p className="text-xl font-bold text-white">{count}</p>
        </div>
      ))}
    </div>
  );
}
