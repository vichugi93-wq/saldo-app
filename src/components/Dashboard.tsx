import { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Lock, SlidersHorizontal, X, Check, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { CurrencyCode } from '../types/currency';
import { Budget } from '../hooks/useBudgets';
import { IncomeExpenseBarChart } from './Charts/BarChart';
import { NetBalanceLineChart } from './Charts/LineChart';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

interface PlanInfo {
  isPro: boolean;
  canUseAdvancedCharts: boolean;
  plan: string;
  expiresSOon?: boolean;
  daysUntilExpiry?: number | null;
}

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
  planInfo: PlanInfo;
  onUpgrade: () => void;
  monthlyTransactions: Transaction[];
  budgets: Budget[];
  onUpsertBudget: (category: string, amount: number) => Promise<void>;
  onDeleteBudget: (category: string) => Promise<void>;
}

// ─── Editor de presupuestos ───────────────────────────────────────────────────

function BudgetEditor({
  budgets, spendByCategory, currency, onUpsert, onDelete, onClose,
}: {
  budgets: Budget[];
  spendByCategory: Record<string, number>;
  currency: CurrencyCode;
  onUpsert: (category: string, amount: number) => Promise<void>;
  onDelete: (category: string) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    budgets.forEach((b) => { map[b.category] = String(b.amount); });
    return map;
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));

  const handleSave = async (cat: string) => {
    const raw = values[cat]?.replace(/\./g, '').replace(',', '.');
    const amt = parseFloat(raw ?? '');
    if (!amt || amt <= 0) return;
    setSaving(cat);
    setSaveError('');
    try {
      await onUpsert(cat, amt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('relation') && msg.includes('does not exist')) {
        setSaveError('La tabla de presupuestos no existe aún. Ejecutá el SQL "supabase-budgets-setup.sql" en Supabase primero.');
      } else {
        setSaveError('No se pudo guardar. Revisá tu conexión e intentá de nuevo.');
      }
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (cat: string) => {
    setSaving(cat);
    setSaveError('');
    try {
      await onDelete(cat);
      setValues((v) => { const n = { ...v }; delete n[cat]; return n; });
    } catch {
      setSaveError('No se pudo eliminar. Intentá de nuevo.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="card space-y-1 tab-enter">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold text-sm">Editar presupuestos mensuales</h3>
        <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg hover:bg-border transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="space-y-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const hasBudget = cat in budgetMap;
          const spent = spendByCategory[cat] ?? 0;
          const color = CATEGORY_COLORS[cat] ?? '#8b8b93';
          return (
            <div key={cat} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted text-xs w-28 flex-shrink-0 truncate">{cat}</span>
              <input
                type="number"
                value={values[cat] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
                placeholder={spent > 0 ? `gastado: ${formatCurrency(spent, currency)}` : 'Sin límite'}
                className="input flex-1 text-xs py-1.5 h-8"
                min="0"
              />
              <button
                onClick={() => handleSave(cat)}
                disabled={saving === cat || !values[cat]}
                className="p-1.5 rounded-lg bg-income/10 text-income border border-income/20 hover:bg-income hover:text-black transition-colors disabled:opacity-30 flex-shrink-0"
              >
                {saving === cat ? <span className="w-3 h-3 block border border-current border-t-transparent rounded-full animate-spin" /> : <Check size={12} />}
              </button>
              {hasBudget && (
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={saving === cat}
                  className="p-1.5 rounded-lg text-muted hover:text-expense hover:bg-expense/10 transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {saveError && (
        <div className="bg-expense/10 border border-expense/30 rounded-lg p-2.5 mt-2">
          <p className="text-expense text-xs">{saveError}</p>
        </div>
      )}
      <p className="text-muted text-xs pt-1">Los cambios se guardan por categoría al presionar ✓</p>
    </div>
  );
}

// ─── Barras de categorías con presupuesto ────────────────────────────────────

function CategoryBars({
  transactions, currency, budgets, onEdit,
}: {
  transactions: Transaction[];
  currency: CurrencyCode;
  budgets: Budget[];
  onEdit: () => void;
}) {
  const [animate, setAnimate] = useState(false);

  const { byCategory, spendByCategory } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const map: Record<string, number> = {};
    expenses.forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8);
    return { byCategory: sorted, spendByCategory: map };
  }, [transactions]);

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));
  const hasBudgets = budgets.length > 0;
  const fmt = (n: number) => formatCurrency(n, currency);
  const maxRaw = byCategory[0]?.[1] ?? 1;

  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  if (byCategory.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted text-sm">Sin gastos registrados este mes.</p>
        <button onClick={onEdit} className="text-xs text-pro hover:text-pro/80 mt-2 transition-colors">
          + Configurar presupuestos igualmente
        </button>
      </div>
    );
  }

  // Categorías con presupuesto excedido para el badge de alerta
  const overBudgetCount = budgets.filter((b) => (spendByCategory[b.category] ?? 0) > b.amount).length;

  return (
    <div className="space-y-3">
      {byCategory.map(([cat, spent], i) => {
        const budget = budgetMap[cat];
        const color = CATEGORY_COLORS[cat] ?? '#8b8b93';
        const hasBudget = budget !== undefined;

        let barPct: number;
        let barColor: string;

        if (hasBudget) {
          barPct = Math.min(110, (spent / budget) * 100);
          barColor = barPct >= 100 ? '#ef4444' : barPct >= 80 ? '#eab308' : color;
        } else {
          barPct = (spent / maxRaw) * 100;
          barColor = color;
        }

        return (
          <div key={cat}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-sm text-white flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 inline-block"
                  style={{ backgroundColor: color }}
                />
                {cat}
                {hasBudget && barPct >= 100 && (
                  <AlertTriangle size={11} className="text-expense" />
                )}
              </span>
              <span className="amount text-sm flex items-baseline gap-1">
                <span className={hasBudget && barPct >= 100 ? 'text-expense font-semibold' : 'text-white'}>
                  {fmt(spent)}
                </span>
                {hasBudget && (
                  <span className="text-muted text-xs">/ {fmt(budget)}</span>
                )}
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="bar-fill"
                style={{
                  width: animate ? `${barPct}%` : '0%',
                  backgroundColor: barColor,
                  transitionDelay: `${i * 55}ms`,
                }}
              />
            </div>
            {hasBudget && (
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-muted">{Math.round(barPct)}% del presupuesto</span>
                {barPct < 100 && (
                  <span className="text-xs text-muted">quedan {fmt(budget - spent)}</span>
                )}
                {barPct >= 100 && (
                  <span className="text-xs text-expense font-medium">+{fmt(spent - budget)} excedido</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-1">
        {overBudgetCount > 0 && (
          <span className="text-expense text-xs flex items-center gap-1">
            <AlertTriangle size={11} />
            {overBudgetCount} categoría{overBudgetCount !== 1 ? 's' : ''} excedida{overBudgetCount !== 1 ? 's' : ''}
          </span>
        )}
        <button
          onClick={onEdit}
          className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1 ml-auto"
        >
          <SlidersHorizontal size={11} />
          {hasBudgets ? 'Editar presupuestos' : 'Configurar presupuestos'}
        </button>
      </div>
    </div>
  );
}

// ─── Resumen de presupuesto mensual ──────────────────────────────────────────

function BudgetSummary({
  budgets, spendByCategory, currency,
}: {
  budgets: Budget[];
  spendByCategory: Record<string, number>;
  currency: CurrencyCode;
}) {
  if (budgets.length === 0) return null;

  const fmt = (n: number) => formatCurrency(n, currency);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + (spendByCategory[b.category] ?? 0), 0);
  const remaining   = totalBudget - totalSpent;
  const pct         = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const isOver      = totalSpent > totalBudget;

  return (
    <div className={`card ${isOver ? 'border-expense/30 bg-expense/5' : 'border-border'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-muted text-xs">Presupuesto total del mes</p>
          <p className="amount text-white font-semibold text-base mt-0.5">{fmt(totalBudget)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs">
            {isOver ? 'Excedido' : 'Disponible'}
          </p>
          <p className={`amount font-semibold text-base mt-0.5 ${isOver ? 'text-expense' : 'text-income'}`}>
            {isOver ? '+' : ''}{fmt(Math.abs(remaining))}
          </p>
        </div>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? '#ef4444' : pct >= 80 ? '#eab308' : '#22c55e',
          }}
        />
      </div>
      <p className="text-muted text-xs mt-1">{pct}% del presupuesto usado · {fmt(totalSpent)} gastados</p>
    </div>
  );
}

// ─── Feature bloqueada ────────────────────────────────────────────────────────

function LockedFeature({ label, onUpgrade }: { label: string; onUpgrade: () => void }) {
  return (
    <div
      onClick={onUpgrade}
      className="card cursor-pointer hover:border-pro/40 transition-colors relative overflow-hidden"
    >
      <div className="blur-[3px] pointer-events-none select-none">
        <div className="h-4 skeleton rounded w-2/3 mb-3" />
        <div className="h-28 skeleton rounded" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Lock size={20} className="text-pro" />
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-pro text-xs font-medium">Activar Plan Pro →</span>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard({
  transactions, currency, planInfo, onUpgrade,
  monthlyTransactions, budgets, onUpsertBudget, onDeleteBudget,
}: Props) {
  const [editingBudgets, setEditingBudgets] = useState(false);
  const fmt = (n: number) => formatCurrency(n, currency);

  const totals = useMemo(() => {
    const income  = monthlyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthlyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [monthlyTransactions]);

  const spendByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions.filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  }, [monthlyTransactions]);

  const prevExpense = useMemo(() => {
    const now  = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end  = new Date(now.getFullYear(), now.getMonth(), 0);
    return transactions
      .filter((t) => t.type === 'expense' && new Date(t.date + 'T00:00:00') >= prev && new Date(t.date + 'T00:00:00') <= end)
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const pctGastado = totals.income > 0 ? Math.round((totals.expense / totals.income) * 100) : 0;
  const diffGasto  = prevExpense > 0 ? Math.round(((totals.expense - prevExpense) / prevExpense) * 100) : null;
  const isPositive = totals.net >= 0;
  const { expiresSOon, daysUntilExpiry } = planInfo;

  return (
    <div className="space-y-4 tab-enter">

      {/* Banner vencimiento */}
      {expiresSOon && daysUntilExpiry != null && (
        <button
          onClick={onUpgrade}
          className="w-full card border-goal/40 bg-goal/5 flex items-center justify-between gap-3 hover:border-goal transition-colors text-left"
        >
          <div>
            <p className="text-goal text-sm font-semibold">
              Tu plan Pro vence en {daysUntilExpiry} día{daysUntilExpiry !== 1 ? 's' : ''}
            </p>
            <p className="text-muted text-xs mt-0.5">Renovalo para no perder acceso.</p>
          </div>
          <span className="text-goal text-xs font-bold whitespace-nowrap">Renovar →</span>
        </button>
      )}

      {/* Balance principal */}
      <div className={`card border-0 rounded-2xl p-6 relative overflow-hidden
        ${isPositive ? 'bg-gradient-to-br from-income/10 via-surface to-bg' : 'bg-gradient-to-br from-expense/10 via-surface to-bg'}`}
      >
        <p className="text-muted text-xs uppercase tracking-widest font-medium mb-1">Saldo del mes</p>
        <p className={`font-display tabular font-bold leading-none mt-2 mb-3 ${isPositive ? 'text-income' : 'text-expense'} text-[2.5rem] sm:text-[3rem]`}>
          {isPositive ? '+' : ''}{fmt(totals.net)}
        </p>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs">equilibrio</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-income" />
            <span className="amount text-income text-sm font-semibold">{fmt(totals.income)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-expense" />
            <span className="amount text-expense text-sm font-semibold">{fmt(totals.expense)}</span>
          </div>
        </div>
      </div>

      {/* Stats secundarias */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-muted text-xs mb-1">% del ingreso gastado</p>
          <p className={`amount text-xl font-bold ${pctGastado > 80 ? 'text-expense' : pctGastado > 60 ? 'text-goal' : 'text-income'}`}>
            {pctGastado}%
          </p>
        </div>
        <div className="card">
          <p className="text-muted text-xs mb-1">vs mes anterior</p>
          <p className={`amount text-xl font-bold ${diffGasto == null ? 'text-muted' : diffGasto > 0 ? 'text-expense' : 'text-income'}`}>
            {diffGasto == null ? '—' : `${diffGasto > 0 ? '+' : ''}${diffGasto}%`}
          </p>
          <p className="text-muted text-xs mt-0.5">en gastos</p>
        </div>
      </div>

      {/* Resumen de presupuesto total */}
      <BudgetSummary
        budgets={budgets}
        spendByCategory={spendByCategory}
        currency={currency}
      />

      {/* Barras de categorías */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 text-sm">Gastos por categoría</h3>
        <CategoryBars
          transactions={monthlyTransactions}
          currency={currency}
          budgets={budgets}
          onEdit={() => setEditingBudgets(true)}
        />
      </div>

      {/* Editor de presupuestos */}
      {editingBudgets && (
        <BudgetEditor
          budgets={budgets}
          spendByCategory={spendByCategory}
          currency={currency}
          onUpsert={onUpsertBudget}
          onDelete={onDeleteBudget}
          onClose={() => setEditingBudgets(false)}
        />
      )}

      {/* Gráficos avanzados — Pro */}
      {planInfo.canUseAdvancedCharts ? (
        <>
          <div className="card">
            <h3 className="font-semibold text-white mb-3 text-sm">Ingresos vs Gastos por semana</h3>
            <IncomeExpenseBarChart transactions={transactions} currency={currency} />
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-3 text-sm">Evolución del saldo (3 meses)</h3>
            <NetBalanceLineChart transactions={transactions} currency={currency} />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <LockedFeature label="Ingresos vs Gastos semanal" onUpgrade={onUpgrade} />
          <LockedFeature label="Evolución del saldo — 3 meses" onUpgrade={onUpgrade} />
        </div>
      )}
    </div>
  );
}
