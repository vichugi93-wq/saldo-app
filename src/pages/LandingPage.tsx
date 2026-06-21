import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import {
  CreditCard, Target, Bot, Users, BarChart3, CheckCircle2, Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CreditCard,
    title: 'Registro de movimientos',
    desc: 'Anotá ingresos y gastos en segundos. Categorizá automáticamente y buscá cualquier transacción.',
  },
  {
    icon: Target,
    title: 'Metas de ahorro',
    desc: 'Creá objetivos concretos (vacaciones, fondo de emergencia, electrodoméstico) y seguí tu progreso.',
  },
  {
    icon: Bot,
    title: 'Análisis con IA',
    desc: 'Recibí consejos personalizados según tus hábitos. La IA detecta patrones y te sugiere dónde ajustar.',
  },
  {
    icon: Globe,
    title: 'Multi-moneda',
    desc: 'Guaraníes, pesos argentinos, dólares, reales y más. Cambiá de moneda en cualquier momento.',
  },
  {
    icon: Users,
    title: 'Grupo familiar',
    desc: 'Compartí acceso con hasta 4 personas de tu familia. Finanzas del hogar en un solo lugar.',
  },
  {
    icon: BarChart3,
    title: 'Gráficos y reportes',
    desc: 'Visualizá tus finanzas mes a mes y exportá todo a Excel con un clic.',
  },
];

const PLANS = [
  {
    name: 'Básico',
    price: 'Gratis',
    color: 'text-muted',
    border: 'border-border',
    features: ['50 transacciones/mes', '1 meta de ahorro', 'Resumen mensual'],
    cta: 'Empezar gratis',
    href: '/registro',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'USD 4/mes',
    color: 'text-income',
    border: 'border-income/40',
    features: [
      'Transacciones ilimitadas',
      'Metas ilimitadas',
      'Análisis con IA',
      'Gráficos avanzados',
      'Exportar a Excel',
    ],
    cta: 'Probar 30 días gratis',
    href: '/registro',
    highlight: true,
  },
  {
    name: 'Familiar',
    price: 'USD 8/mes',
    color: 'text-goal',
    border: 'border-goal/40',
    features: [
      'Todo lo de Pro',
      'Hasta 4 perfiles familiares',
      'Finanzas del hogar compartidas',
    ],
    cta: 'Empezar gratis',
    href: '/registro',
    highlight: false,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <Head>
        <title>Saldo — Controlá tus finanzas personales en guaraníes y más monedas | LATAM</title>
        <meta name="description" content="Saldo es la app de finanzas personales pensada para Paraguay y LATAM. Controlá gastos, ahorrá con metas y recibí análisis con IA. Gratis para siempre." />
      </Head>
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Saldo" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-income text-xl tracking-tight">Saldo</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/blog" className="text-muted text-sm hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
              Blog
            </Link>
            <Link to="/login" className="text-sm text-white hover:text-income transition-colors px-3 py-1.5">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn-primary text-sm py-1.5 px-4">
              Registrate gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-income/10 border border-income/20 rounded-full px-4 py-1.5 text-income text-xs font-medium mb-8">
          ✨ 30 días de Plan Pro gratis al registrarte
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Controlá tus finanzas personales
          <br />
          <span className="text-income">en guaraníes, pesos o tu moneda</span>
        </h1>
        <p className="text-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Saldo es la app de finanzas pensada para Paraguay y toda LATAM. Registrá gastos, creá metas de ahorro y recibí análisis con inteligencia artificial — todo en tu moneda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/registro" className="btn-primary text-base py-3 px-8 w-full sm:w-auto">
            Empezar gratis — es fácil
          </Link>
          <Link to="/login" className="btn-secondary text-base py-3 px-8 w-full sm:w-auto">
            Ya tengo cuenta
          </Link>
        </div>
        <p className="text-muted text-xs mt-4">Sin tarjeta de crédito. Sin compromisos.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-12 border-t border-border">
          {[
            { value: '100%', label: 'Gratis para empezar' },
            { value: 'IA', label: 'Análisis inteligente' },
            { value: '10+', label: 'Monedas soportadas' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-bold text-income">{value}</p>
              <p className="text-muted text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface border-y border-border py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Todo lo que necesitás para ordenar tu plata</h2>
            <p className="text-muted max-w-xl mx-auto">Sin complicaciones. Sin configuraciones interminables. Empezás a registrar en menos de un minuto.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-income/30 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-income/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-income" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Planes para cada etapa</h2>
          <p className="text-muted">Empezá gratis. Actualizá cuando quieras crecer.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(({ name, price, color, border, features, cta, href, highlight }) => (
            <div
              key={name}
              className={`relative bg-surface border ${border} rounded-xl p-6 flex flex-col gap-4 ${highlight ? 'ring-1 ring-income/30' : ''}`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-income text-black text-xs font-bold px-3 py-0.5 rounded-full">
                  Más popular
                </div>
              )}
              <div>
                <p className={`font-display font-bold text-lg ${color}`}>{name}</p>
                <p className="text-white text-2xl font-bold mt-1">{price}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 size={14} className="text-income mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={href} className={highlight ? 'btn-primary text-sm text-center py-2' : 'btn-secondary text-sm text-center py-2'}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SEO bridge to Paraguay page */}
      <section className="bg-surface border-y border-border py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-muted text-sm uppercase tracking-widest font-medium mb-3">Hecho para Paraguay</p>
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            La primera app de finanzas personales pensada para el guaraní
          </h2>
          <p className="text-muted mb-6 leading-relaxed">
            Saldo nació en Paraguay para responder a una necesidad concreta: llevar las cuentas en guaraníes sin depender de conversiones ni apps pensadas para otros mercados.
          </p>
          <Link to="/finanzas-paraguay" className="btn-secondary text-sm inline-block px-6 py-2">
            Leer más sobre Saldo en Paraguay →
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-4">Empezá hoy, es gratis</h2>
        <p className="text-muted mb-8">30 días de Plan Pro incluidos. Sin tarjeta. Sin compromisos.</p>
        <Link to="/registro" className="btn-primary text-base py-3 px-10 inline-block">
          Crear mi cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Saldo" className="w-6 h-6 rounded-md" />
            <span className="font-display font-semibold text-white">Saldo</span>
            <span>— Hecho en Paraguay 🇵🇾</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link to="/finanzas-paraguay" className="hover:text-white transition-colors">Paraguay</Link>
            <Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link to="/registro" className="hover:text-white transition-colors">Registrarse</Link>
          </nav>
          <p>© 2026 Saldo</p>
        </div>
      </footer>
    </div>
  );
}
