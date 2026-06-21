import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = 'Restablecer contraseña — Saldo';

    // Supabase procesa el token de recuperación del hash de la URL y emite PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('expired') || msg.includes('invalid')) {
        setError('El enlace expiró. Solicitá uno nuevo desde el login.');
      } else {
        setError('No se pudo actualizar la contraseña. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/">
            <img src="/logo.svg" alt="Saldo" className="w-16 h-16 rounded-2xl shadow-glow-income" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-income">Saldo</h1>
            <p className="text-muted text-sm mt-1">Tus finanzas, bajo control</p>
          </div>
        </div>

        <div className="card">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Nueva contraseña</h3>
            {success ? (
              <div className="text-center space-y-2 py-4">
                <div className="text-3xl">✅</div>
                <p className="text-income text-sm font-medium">¡Contraseña actualizada!</p>
                <p className="text-muted text-sm">Serás redirigido al login en unos segundos...</p>
              </div>
            ) : !ready ? (
              <p className="text-muted text-sm py-2">Verificando enlace de recuperación...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input"
                    placeholder="Repetí la nueva contraseña"
                    required
                  />
                </div>
                {error && <p className="text-expense text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center">
          <Link to="/login" className="text-muted text-xs hover:text-white transition-colors">
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
