import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../content/blog';
import { ArrowLeft, Calendar } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PY', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function BlogListPage() {
  useEffect(() => {
    document.title = 'Blog de finanzas personales — Saldo';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Artículos sobre finanzas personales, presupuesto y ahorro pensados para Paraguay y LATAM.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>

        <h1 className="font-display text-3xl font-bold text-white mb-2">Blog</h1>
        <p className="text-muted mb-10">Finanzas personales sin complicaciones, en español rioplatense.</p>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block card hover:border-income/30 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
                <Calendar size={12} />
                {formatDate(post.date)}
              </div>
              <h2 className="font-display text-lg font-semibold text-white group-hover:text-income transition-colors mb-1.5">
                {post.title}
              </h2>
              <p className="text-muted text-sm leading-relaxed">{post.description}</p>
              <p className="text-income text-xs mt-3 font-medium">Leer artículo →</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted">
          <Link to="/" className="hover:text-white transition-colors">← Volver a Saldo</Link>
          <span>© 2026 Saldo — Hecho en Paraguay 🇵🇾</span>
        </div>
      </footer>
    </div>
  );
}
