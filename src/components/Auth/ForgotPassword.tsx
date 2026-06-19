import { useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (err) throw err;
      setSent(true);
    } catch {
      setError('No se pudo enviar el email. Verificá que la dirección sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-muted text-sm hover:text-white transition-colors flex items-center gap-1">
        ← Volver
      </button>
      <h3 className="text-white font-semibold">Recuperar contraseña</h3>
      {sent ? (
        <div className="text-center space-y-2 py-4">
          <div className="text-3xl">✉️</div>
          <p className="text-income text-sm font-medium">¡Email enviado!</p>
          <p className="text-muted text-sm">Revisá tu bandeja de entrada para restablecer tu contraseña.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email de tu cuenta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
              required
            />
          </div>
          {error && <p className="text-expense text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando...' : 'Enviar email de recuperación'}
          </button>
        </form>
      )}
    </div>
  );
}
