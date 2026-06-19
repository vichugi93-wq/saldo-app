import { useState, FormEvent } from 'react';

interface Props {
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
}

export function RegisterForm({ onSignUp }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await onSignUp(email, password, name);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already registered')) setError('Este email ya está registrado.');
      else setError('Error al crear la cuenta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-4xl">📧</div>
        <p className="text-income font-semibold">¡Cuenta creada!</p>
        <p className="text-muted text-sm">
          Te enviamos un email de confirmación. Revisá tu bandeja de entrada para activar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Tu nombre"
          required
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Mínimo 6 caracteres"
          required
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label">Confirmar contraseña</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
          placeholder="Repetí tu contraseña"
          required
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-expense text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
      </button>
      <p className="text-muted text-xs text-center">
        Al registrarte recibís 30 días de Plan Pro sin cargo.
      </p>
    </form>
  );
}
