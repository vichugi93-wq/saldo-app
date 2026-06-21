import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthContext } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { FinanzasParaguayPage } from './pages/FinanzasParaguayPage';
import { ResetPassword } from './components/Auth/ResetPassword';
import App from './App';

function Skeleton() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="Saldo" className="w-16 h-16 rounded-2xl animate-pulse" />
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-income/40 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  if (loading) return <Skeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/"                    element={<LandingPage />} />
      <Route path="/login"               element={<LoginPage />} />
      <Route path="/registro"            element={<RegisterPage />} />
      <Route path="/blog"                element={<BlogListPage />} />
      <Route path="/blog/:slug"          element={<BlogArticlePage />} />
      <Route path="/finanzas-paraguay"   element={<FinanzasParaguayPage />} />
      <Route path="/restablecer-contrasena" element={<ResetPassword />} />
      <Route path="/app"                 element={<ProtectedRoute><App /></ProtectedRoute>} />
      <Route path="*"                    element={<Navigate to="/" replace />} />
    </Routes>
  );
}
