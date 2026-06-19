import { useState } from 'react';
import { PaymentRequest } from '../../types/paymentRequest';
import { supabase } from '../../lib/supabase';

interface Props {
  request: PaymentRequest;
  adminId: string;
  onUpdated: () => void;
}

export function PaymentRequestCard({ request, adminId, onUpdated }: Props) {
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusColor: Record<string, string> = {
    pending: 'text-goal',
    approved: 'text-income',
    rejected: 'text-expense',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  };

  const approve = async () => {
    setLoading(true);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await supabase.from('payment_requests').update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', request.id);
    await supabase.from('profiles').update({
      plan: request.plan_requested,
      plan_expires_at: expiresAt.toISOString(),
    }).eq('id', request.user_id);
    setLoading(false);
    onUpdated();
  };

  const reject = async () => {
    if (!rejectNote.trim()) return;
    setLoading(true);
    await supabase.from('payment_requests').update({
      status: 'rejected',
      admin_note: rejectNote,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', request.id);
    setLoading(false);
    onUpdated();
  };

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-medium text-sm">
            Plan {request.plan_requested === 'pro' ? 'Pro' : 'Familiar'}
          </p>
          <p className="text-muted text-xs">{new Date(request.created_at).toLocaleDateString('es-PY')}</p>
        </div>
        <span className={`text-xs font-bold ${statusColor[request.status]}`}>
          {statusLabel[request.status]}
        </span>
      </div>

      {request.reference_note && (
        <p className="text-muted text-xs bg-border/50 rounded-lg p-2">
          Nota: {request.reference_note}
        </p>
      )}

      {request.admin_note && (
        <p className="text-expense text-xs">Admin: {request.admin_note}</p>
      )}

      <a
        href={request.receipt_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-income text-xs hover:underline flex items-center gap-1"
      >
        📎 Ver comprobante
      </a>

      {request.status === 'pending' && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={loading}
              className="btn-primary flex-1 text-sm py-1.5"
            >
              ✓ Aprobar
            </button>
            <button
              onClick={() => setShowReject(!showReject)}
              className="btn-danger flex-1 text-sm py-1.5"
            >
              ✗ Rechazar
            </button>
          </div>
          {showReject && (
            <div className="space-y-2">
              <input
                type="text"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="input text-sm"
                placeholder="Motivo del rechazo (obligatorio)"
              />
              <button
                onClick={reject}
                disabled={loading || !rejectNote.trim()}
                className="btn-danger w-full text-sm py-1.5"
              >
                {loading ? 'Procesando...' : 'Confirmar rechazo'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
