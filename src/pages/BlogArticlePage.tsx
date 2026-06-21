import { Link, useParams, Navigate } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getPostBySlug } from '../content/blog';
import { ArrowLeft, Calendar } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PY', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <Head>
        <title>{post.title} — Blog Saldo</title>
        <meta name="description" content={post.description} />
      </Head>
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Saldo" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-income text-lg">Saldo</span>
          </Link>
          <Link to="/registro" className="btn-primary text-sm py-1.5 px-4">Registrate gratis</Link>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} />
          Todos los artículos
        </Link>

        <div className="flex items-center gap-1.5 text-muted text-xs mb-4">
          <Calendar size={12} />
          {formatDate(post.date)}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-muted text-lg leading-relaxed mb-10 border-b border-border pb-8">
          {post.description}
        </p>

        {/* Article body */}
        <div
          className="prose-saldo"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-14 p-6 bg-surface border border-income/20 rounded-xl text-center">
          <p className="font-display font-bold text-white text-lg mb-2">¿Querés ordenar tus finanzas?</p>
          <p className="text-muted text-sm mb-4">Registrate gratis en Saldo y empezá a llevar el control de tus gastos hoy.</p>
          <Link to="/registro" className="btn-primary inline-block px-6 py-2 text-sm">
            Crear cuenta gratis →
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-[680px] mx-auto px-4 flex items-center justify-between text-sm text-muted">
          <Link to="/blog" className="hover:text-white transition-colors">← Más artículos</Link>
          <span>© 2026 Saldo — Hecho en Paraguay 🇵🇾</span>
        </div>
      </footer>
    </div>
  );
}
