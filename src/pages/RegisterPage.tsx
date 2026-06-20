import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useAuthContext } from '../contexts/AuthContext';

export function RegisterPage() {
  const { user, signUp } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    document.title = 'Crear cuenta — Saldo';
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
            <p className="text-muted text-sm mt-1">30 días de Plan Pro gratis</p>
          </div>
        </div>

        <div className="card">
          <RegisterForm onSignUp={signUp} />
        </div>

        <p className="text-center text-muted text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-income hover:underline">
            Iniciá sesión
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
