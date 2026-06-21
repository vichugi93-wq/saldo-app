import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const BENEFITS = [
  'Registrá gastos directamente en guaraníes, sin convertir a otras monedas',
  'Categorías adaptadas a los hábitos de consumo locales',
  'Interfaz en español rioplatense, pensada para el contexto latinoamericano',
  'Funciona 100% desde el celular, sin necesidad de instalar nada',
  'Exportá tus movimientos a Excel para compartir con tu contador',
  'Metas de ahorro en la moneda que usás en el día a día',
];

export function FinanzasParaguayPage() {
  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <Head>
        <title>App de finanzas personales para Paraguay — Control de gastos en guaraníes | Saldo</title>
        <meta name="description" content="Saldo es la app de finanzas personales diseñada para Paraguay. Controlá tus gastos en guaraníes, creá presupuestos y ahorrá más cada mes. Gratis." />
      </Head>
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Saldo" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-income text-lg">Saldo</span>
          </Link>
          <Link to="/registro" className="btn-primary text-sm py-1.5 px-4">Registrate gratis</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="mb-14">
          <p className="text-income text-sm font-medium uppercase tracking-widest mb-3">Paraguay 🇵🇾</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            La app de finanzas personales
            <br />
            <span className="text-income">pensada para el guaraní</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl">
            La mayoría de las apps de finanzas están diseñadas para dólares, euros o pesos. Saldo nació en Paraguay para cubrir una necesidad concreta: llevar el control de gastos directamente en guaraníes, sin conversiones ni fricción.
          </p>
        </div>

        {/* Por qué es diferente */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-white mb-6">
            ¿Por qué una app de finanzas para Paraguay es diferente?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-white mb-2">El problema con las apps genéricas</h3>
              <p className="text-muted text-sm leading-relaxed">
                Las apps internacionales no piensan en guaraníes. Eso significa que o bien tenés que hacer conversiones constantes, o los montos se ven mal formateados, o la interfaz no tiene sentido para la realidad económica local. El resultado: las abandonás al mes.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-white mb-2">La solución de Saldo</h3>
              <p className="text-muted text-sm leading-relaxed">
                Saldo trata al guaraní como una moneda de primera clase. Los montos se muestran con el formato local (₲ 2.500.000), las categorías reflejan los hábitos de gasto de Paraguay, y toda la experiencia está pensada para que registrar un gasto sea tan fácil como mandarlo por WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-white mb-6">
            Lo que obtenés al usar Saldo en Paraguay
          </h2>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-income mt-0.5 shrink-0" />
                <span className="text-muted text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contexto local */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Finanzas personales en el contexto paraguayo
          </h2>
          <div className="space-y-4 text-muted text-sm leading-relaxed">
            <p>
              En Paraguay, los salarios se cobran en guaraníes, los alquileres muchas veces se pactan en dólares, y los gastos cotidianos — supermercado, transporte, salud — están en guaraníes. Esa mezcla de monedas hace que manejar las finanzas sea más difícil de lo que debería.
            </p>
            <p>
              Saldo resuelve ese problema de forma simple: podés elegir tu moneda principal (guaraní, dólar, peso argentino u otras), y toda la app se adapta. Si tu realidad es mezclar, Saldo también te acompaña.
            </p>
            <p>
              Además, a diferencia de otras herramientas, Saldo no requiere conectar tu cuenta bancaria ni dar acceso a tus datos financieros. Vos ingresás manualmente lo que gastás, lo que te da control total sobre tu información.
            </p>
          </div>
        </section>

        {/* Búsquedas relacionadas */}
        <section className="mb-14 bg-surface border border-border rounded-xl p-6">
          <h2 className="font-display text-lg font-bold text-white mb-3">¿Buscabas algo de esto?</h2>
          <ul className="flex flex-wrap gap-2">
            {[
              'app finanzas personales Paraguay',
              'control de gastos en guaraníes',
              'presupuesto mensual Paraguay',
              'ahorrar en guaraníes',
              'app para llevar cuentas Paraguay',
              'gestión de dinero LATAM',
            ].map((tag) => (
              <li key={tag} className="bg-border text-muted text-xs px-3 py-1 rounded-full">
                {tag}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-income/5 border border-income/20 rounded-xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            Empezá a controlar tus finanzas hoy
          </h2>
          <p className="text-muted mb-6">
            Gratis para siempre en el plan Básico. 30 días de Plan Pro incluidos al registrarte.
          </p>
          <Link to="/registro" className="btn-primary inline-block px-8 py-2.5">
            Crear mi cuenta gratis
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
          <Link to="/" className="hover:text-white transition-colors">← Inicio</Link>
          <nav className="flex gap-4">
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link to="/registro" className="hover:text-white transition-colors">Registrarse</Link>
          </nav>
          <span>© 2026 Saldo — Hecho en Paraguay 🇵🇾</span>
        </div>
      </footer>
    </div>
  );
}
