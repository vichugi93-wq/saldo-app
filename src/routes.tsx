import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { FinanzasParaguayPage } from './pages/FinanzasParaguayPage';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
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

// Rutas públicas (sin AuthProvider) — estas se pre-renderizan en SSG
// Rutas de auth (con AuthProvider)  — solo SPA client-side
export const routes: RouteObject[] = [
  { path: '/',                  Component: LandingPage },
  { path: '/finanzas-paraguay', Component: FinanzasParaguayPage },
  { path: '/blog',              Component: BlogListPage },
  { path: '/blog/:slug',        Component: BlogArticlePage },
  {
    // Layout que provee AuthProvider para las rutas que lo necesitan
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      { path: '/login',    Component: LoginPage },
      { path: '/registro', Component: RegisterPage },
      {
        path: '/app',
        element: <ProtectedRoute><App /></ProtectedRoute>,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
