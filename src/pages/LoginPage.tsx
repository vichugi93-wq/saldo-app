import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { ForgotPassword } from '../components/Auth/ForgotPassword';
import { useAuthContext } from '../contexts/AuthContext';

type View = 'login' | 'forgot';

export function LoginPage() {
  const { user, signIn } = useAuthContext();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('login');

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    document.title = 'Iniciar sesión — Saldo';
  }, []);

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
          {view === 'forgot' ? (
            <ForgotPassword onBack={() => setView('login')} />
          ) : (
            <LoginForm onSignIn={signIn} onForgotPassword={() => setView('forgot')} />
          )}
        </div>

        <p className="text-center text-muted text-sm">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-income hover:underline">
            Registrate gratis
          </Link>
        </p>
        <p className="text-center">
          <Link to="/" className="text-muted text-xs hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
