import { useState, FormEvent } from 'react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
}

export function LoginForm({ onSignIn, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos.');
      else if (msg.includes('Email not confirmed')) setError('Confirmá tu email antes de iniciar sesión.');
      else setError('Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-expense text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-muted text-sm hover:text-white transition-colors w-full text-center"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}
