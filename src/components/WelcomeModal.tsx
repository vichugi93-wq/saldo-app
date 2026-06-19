import { useState } from 'react';
import { CurrencyCode } from '../types/currency';
import { CURRENCIES } from '../utils/currencies';

interface Props {
  defaultName: string;
  onComplete: (name: string, currency: CurrencyCode) => Promise<void>;
}

const PLAN_SUMMARY = [
  { name: 'Básico', price: 'Gratis', features: ['50 transacciones/mes', '1 meta de ahorro', 'Dashboard básico'] },
  { name: 'Pro ✨', price: '$4 USD/mes', features: ['Ilimitado todo', 'Análisis IA', 'Exportar reportes', 'Gráficos avanzados'] },
  { name: 'Familiar', price: '$8 USD/mes', features: ['Todo lo de Pro', 'Hasta 4 perfiles familiares', 'Dashboard consolidado'] },
];

export function WelcomeModal({ defaultName, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [currency, setCurrency] = useState<CurrencyCode>('PYG');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    await onComplete(name, currency);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 fade-in">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-income' : 'bg-border'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">¡Bienvenido a Saldo!</h2>
              <p className="text-muted text-sm mt-1">Primero, ¿cómo querés que te llamemos?</p>
            </div>
            <div>
              <label className="label">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Tu nombre"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="btn-primary w-full"
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Tu moneda</h2>
              <p className="text-muted text-sm mt-1">Seleccioná tu moneda preferida</p>
            </div>
            <div>
              <label className="label">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="input"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Atrás</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Continuar →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Elegí tu plan</h2>
              <p className="text-muted text-sm mt-1">Empezás con 30 días gratis de Plan Pro</p>
            </div>
            <div className="space-y-3">
              {PLAN_SUMMARY.map((p) => (
                <div key={p.name} className={`card ${p.name.includes('Pro') ? 'border-income' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-income text-sm font-medium">{p.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-muted text-xs flex items-center gap-1.5">
                        <span className="text-income">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Atrás</button>
              <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Guardando...' : '¡Empezar!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
