import { useState, FormEvent, useEffect } from 'react';
import { Target, Trash2, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { Goal } from '../types/goal';
import { CurrencyCode } from '../types/currency';
import { formatCurrency, formatDate, todayISO } from '../utils/formatters';

interface Props {
  goals: Goal[];
  currency: CurrencyCode;
  isPro: boolean;
  maxGoals: number | null;
  netBalance: number;
  onCreateGoal: (data: { name: string; target_amount: number; deadline?: string; category?: string }) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onAddToGoal: (id: string, amount: number) => Promise<void>;
  onUpgrade: () => void;
}

function GoalCard({
  goal, currency, netBalance, onDelete, onAdd,
}: {
  goal: Goal;
  currency: CurrencyCode;
  netBalance: number;
  onDelete: (id: string) => Promise<void>;
  onAdd: (id: string, amount: number) => Promise<void>;
}) {
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  const fmt = (n: number) => formatCurrency(n, currency);
  const remaining = goal.target_amount - goal.current_amount;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const barColor = goal.status === 'completed' || pct === 100
    ? '#22c55e'
    : pct >= 75
    ? '#22c55e'
    : pct >= 40
    ? '#eab308'
    : '#ef4444';

  const handleAdd = async () => {
    const amt = parseFloat(addAmount.replace(',', '.'));
    if (!amt || amt <= 0 || amt > netBalance) return;
    setLoading(true);
    await onAdd(goal.id, amt);
    setAddAmount('');
    setLoading(false);
    if (pct + (amt / goal.target_amount) * 100 >= 100) {
      setJustCompleted(true);
    }
  };

  return (
    <div className={`card transition-colors ${goal.status === 'completed' ? 'border-income/30' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-1.5">
            {goal.status === 'completed' && <CheckCircle2 size={15} className="text-income" />}
            {goal.name}
          </h3>
          {goal.category && <p className="text-muted text-xs mt-0.5">{goal.category}</p>}
          {goal.deadline && <p className="text-muted text-xs">Fecha límite: {formatDate(goal.deadline)}</p>}
        </div>
        {goal.status !== 'completed' && (
          <button
            onClick={() => onDelete(goal.id)}
            className="text-muted hover:text-expense p-1 rounded-lg hover:bg-expense/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-sm">
          <span className="amount text-muted">{fmt(goal.current_amount)}</span>
          <span className="amount text-white font-semibold">{fmt(goal.target_amount)}</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: mounted ? `${pct}%` : '0%',
              backgroundColor: barColor,
              transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {(justCompleted || goal.status === 'completed') && (
              <div className="absolute inset-0 goal-shine-bar animate-goal-shine" />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">{pct}% completado</span>
          {goal.status !== 'completed' && (
            <span className="text-muted">Faltan {fmt(remaining)}</span>
          )}
        </div>
      </div>

      {goal.status === 'completed' ? (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-income/5 border border-income/20 rounded-lg">
          <CheckCircle2 size={15} className="text-income" />
          <span className="text-income text-sm font-medium">Meta alcanzada</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            placeholder={`Hasta ${fmt(Math.min(remaining, netBalance))}`}
            className="input flex-1 text-sm py-1.5"
            min="0"
            max={Math.min(remaining, netBalance)}
          />
          <button
            onClick={handleAdd}
            disabled={loading || !addAmount || parseFloat(addAmount) <= 0}
            className="btn-primary text-sm px-3 py-1.5"
          >
            {loading ? '...' : 'Asignar'}
          </button>
        </div>
      )}
    </div>
  );
}

export function SavingsGoals({
  goals, currency, isPro, maxGoals, netBalance,
  onCreateGoal, onDeleteGoal, onAddToGoal, onUpgrade,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const atLimit = maxGoals !== null && activeGoals.length >= maxGoals;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(target.replace(',', '.'));
    if (!amt || amt <= 0 || !name.trim()) return;
    setLoading(true);
    await onCreateGoal({
      name: name.trim(),
      target_amount: amt,
      deadline: deadline || undefined,
      category: category || undefined,
    });
    setName(''); setTarget(''); setDeadline(''); setCategory('');
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div className="space-y-4 tab-enter">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">Metas de ahorro</h2>
        <button
          onClick={atLimit ? onUpgrade : () => setShowForm(!showForm)}
          className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
        >
          <Plus size={15} />
          Nueva meta
        </button>
      </div>

      {!isPro && (
        <div className="card border-muted/20">
          <p className="text-muted text-xs">
            Plan Básico: {activeGoals.length}/{maxGoals} meta activa.{' '}
            <button onClick={onUpgrade} className="text-pro hover:text-pro/80 transition-colors font-medium inline-flex items-center gap-0.5">
              <Sparkles size={11} />Activá Pro para metas ilimitadas →
            </button>
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h3 className="font-semibold text-white">Nueva meta</h3>
          <div>
            <label className="label">Nombre de la meta</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ej: Vacaciones, Auto, Emergencias" required />
          </div>
          <div>
            <label className="label">Monto objetivo</label>
            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="input" placeholder="0" min="0" step="any" required />
          </div>
          <div>
            <label className="label">Fecha límite (opcional)</label>
            <input type="date" value={deadline} min={todayISO()} onChange={(e) => setDeadline(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Categoría (opcional)</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input" placeholder="Ej: Viaje, Vehículo" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Guardando...' : 'Crear meta'}</button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-goal/10 flex items-center justify-center">
            <Target size={28} className="text-goal" />
          </div>
          <div>
            <p className="text-white font-semibold">Sin metas todavía</p>
            <p className="text-muted text-sm mt-1">Creá tu primera meta de ahorro y empezá a avanzar hacia ella.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-1.5 mt-1"
          >
            <Plus size={15} />
            Crear primera meta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              currency={currency}
              netBalance={netBalance}
              onDelete={onDeleteGoal}
              onAdd={onAddToGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
