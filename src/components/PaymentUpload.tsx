import { useState, FormEvent, useRef } from 'react';
import { PlanRequested } from '../types/paymentRequest';
import { PAYMENT_INFO } from '../utils/paymentInfo';

interface Props {
  planRequested: PlanRequested;
  onSubmit: (plan: PlanRequested, file: File, note?: string) => Promise<void>;
  onCancel: () => void;
  hasPending: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

export function PaymentUpload({ planRequested, onSubmit, onCancel, hasPending }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const info = PAYMENT_INFO.prices[planRequested];

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { setError('Solo se aceptan JPG, PNG o PDF.'); return; }
    if (f.size > MAX_SIZE) { setError('El archivo no puede superar 5MB.'); return; }
    setError('');
    setFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Adjuntá el comprobante de pago.'); return; }
    setLoading(true);
    try {
      await onSubmit(planRequested, file, note || undefined);
      setSuccess(true);
    } catch {
      setError('Error al enviar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPending) {
    return (
      <div className="card text-center space-y-3 py-6">
        <p className="text-2xl">⏳</p>
        <p className="text-white font-semibold">Pago en revisión</p>
        <p className="text-muted text-sm">
          Tu comprobante fue recibido. Normalmente activamos los planes en menos de 24 horas.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card text-center space-y-3 py-6">
        <p className="text-2xl">✅</p>
        <p className="text-income font-semibold">¡Comprobante enviado!</p>
        <p className="text-muted text-sm">
          Tu pago está en revisión. Te avisaremos cuando se active tu plan (normalmente en menos de 24hs).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card border-income/30 space-y-2">
        <p className="text-white font-semibold">Datos de pago — Plan {planRequested === 'pro' ? 'Pro' : 'Familiar'}</p>
        <p className="text-income text-lg font-bold">{info.label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Banco</span>
            <span className="text-white">{PAYMENT_INFO.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Cuenta</span>
            <span className="text-white">{PAYMENT_INFO.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Titular</span>
            <span className="text-white">{PAYMENT_INFO.accountHolder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Alias</span>
            <span className="text-white">{PAYMENT_INFO.alias}</span>
          </div>
        </div>
        <p className="text-muted text-xs bg-border/50 rounded-lg p-2">{PAYMENT_INFO.instructions}</p>
      </div>

      <div>
        <label className="label">Comprobante de pago *</label>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            file ? 'border-income bg-income/5' : 'border-border hover:border-income/50'
          }`}
        >
          {file ? (
            <p className="text-income text-sm">✓ {file.name}</p>
          ) : (
            <>
              <p className="text-muted text-sm">Arrastrá o hacé click para subir</p>
              <p className="text-muted text-xs mt-1">JPG, PNG o PDF — máx. 5MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <label className="label">Nota de referencia (opcional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="Ej: Transferencia del 15/01 desde cuenta 0001"
        />
      </div>

      {error && <p className="text-expense text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading || !file} className="btn-primary flex-1">
          {loading ? 'Enviando...' : 'Enviar comprobante'}
        </button>
      </div>
    </form>
  );
}
