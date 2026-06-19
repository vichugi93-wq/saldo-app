import { useState } from 'react';
import { Check, X, Sparkles, Users } from 'lucide-react';
import { PlanType } from '../types/plan';
import { PaymentRequest } from '../types/paymentRequest';
import { PaymentUpload } from './PaymentUpload';

interface Props {
  currentPlan: PlanType;
  onCreateRequest: (plan: 'pro' | 'family', file: File, note?: string) => Promise<void>;
  pendingRequest: PaymentRequest | null;
}

const PLAN_CARDS = [
  {
    id: 'basic' as PlanType,
    name: 'Básico',
    price: 'Gratis',
    badge: null,
    cardClass: 'border-border',
    features: [
      { label: '50 transacciones/mes', ok: true },
      { label: '1 meta de ahorro', ok: true },
      { label: 'Dashboard básico', ok: true },
      { label: 'Análisis con IA', ok: false },
      { label: 'Gráficos avanzados', ok: false },
      { label: 'Exportar reportes', ok: false },
      { label: 'Perfiles familiares', ok: false },
    ],
  },
  {
    id: 'pro' as PlanType,
    name: 'Pro',
    price: '$4 USD/mes',
    badge: 'Más popular',
    cardClass: 'border-pro shadow-glow-pro',
    features: [
      { label: 'Transacciones ilimitadas', ok: true },
      { label: 'Metas ilimitadas', ok: true },
      { label: 'Dashboard completo', ok: true },
      { label: 'Análisis con IA', ok: true },
      { label: 'Gráficos avanzados', ok: true },
      { label: 'Exportar reportes', ok: true },
      { label: 'Perfiles familiares', ok: false },
    ],
  },
  {
    id: 'family' as PlanType,
    name: 'Familiar',
    price: '$8 USD/mes',
    badge: null,
    cardClass: 'border-goal',
    features: [
      { label: 'Todo lo de Pro incluido', ok: true },
      { label: 'Hasta 4 cuentas privadas', ok: true },
      { label: 'Invitaciones por link', ok: true },
      { label: 'Datos 100% privados por cuenta', ok: true },
      { label: 'Exportar reportes', ok: true },
      { label: 'Análisis con IA', ok: true },
      { label: 'Suscripción compartida', ok: true },
    ],
  },
];

const TESTIMONIALS = [
  { name: 'Martina G.', text: 'El análisis IA me ayudó a ahorrar ₲ 800.000 en un mes.' },
  { name: 'Carlos R.', text: 'Perfecto para llevar las cuentas en familia. Lo uso con mi esposa.' },
  { name: 'Ana P.', text: 'Me di cuenta que gastaba demasiado en delivery. Los gráficos son clarísimos.' },
];

export function Plans({ currentPlan, onCreateRequest, pendingRequest }: Props) {
  const [selected, setSelected] = useState<'pro' | 'family' | null>(null);

  if (selected) {
    return (
      <div className="space-y-4 tab-enter">
        <button onClick={() => setSelected(null)} className="text-muted text-sm hover:text-white transition-colors flex items-center gap-1">
          ← Volver a planes
        </button>
        <h2 className="text-white font-bold text-lg">Activar Plan {selected === 'pro' ? 'Pro' : 'Familiar'}</h2>
        <PaymentUpload
          planRequested={selected}
          onSubmit={onCreateRequest}
          onCancel={() => setSelected(null)}
          hasPending={pendingRequest !== null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 tab-enter">
      <div className="text-center space-y-1">
        <h2 className="text-white font-bold text-xl">Elegí tu plan</h2>
        <p className="text-income text-sm font-medium">Probá Pro gratis por 30 días al registrarte</p>
      </div>

      <div className="space-y-3">
        {PLAN_CARDS.map((plan) => (
          <div key={plan.id} className={`card relative ${plan.cardClass}`}>
            {plan.badge && (
              <span className="absolute -top-3 left-4 badge-pro flex items-center gap-1 text-xs">
                <Sparkles size={10} />
                {plan.badge}
              </span>
            )}
            <div className="flex justify-between items-start mb-3 mt-1">
              <div>
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  {plan.id === 'pro' && <Sparkles size={14} className="text-pro" />}
                  {plan.id === 'family' && <Users size={14} className="text-goal" />}
                  {plan.name}
                </h3>
                {currentPlan === plan.id && (
                  <span className="text-xs text-income">Tu plan actual</span>
                )}
              </div>
              <span className={`font-display font-bold text-sm tabular ${
                plan.id === 'basic' ? 'text-muted' :
                plan.id === 'pro' ? 'text-pro' : 'text-goal'
              }`}>
                {plan.price}
              </span>
            </div>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.ok
                    ? <Check size={14} className="text-income flex-shrink-0" />
                    : <X size={14} className="text-muted/50 flex-shrink-0" />
                  }
                  <span className={f.ok ? 'text-white' : 'text-muted'}>{f.label}</span>
                </li>
              ))}
            </ul>
            {plan.id !== 'basic' && currentPlan !== plan.id && (
              <button
                onClick={() => setSelected(plan.id as 'pro' | 'family')}
                className={`w-full py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-btn hover:shadow-btn-hover hover:-translate-y-px ${
                  plan.id === 'pro'
                    ? 'bg-pro/10 border border-pro/30 text-pro hover:bg-pro hover:text-black hover:border-pro'
                    : 'bg-goal/10 border border-goal/30 text-goal hover:bg-goal hover:text-black hover:border-goal'
                }`}
              >
                Activar {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-semibold text-sm">Lo que dicen nuestros usuarios</h3>
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="card">
            <p className="text-muted text-sm italic">"{t.text}"</p>
            <p className="text-income text-xs mt-1 font-medium">— {t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
