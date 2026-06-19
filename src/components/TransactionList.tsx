import { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, ArrowLeftRight, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory } from '../types/transaction';
import { CurrencyCode } from '../types/currency';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TransactionForm } from './TransactionForm';

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
  isPro: boolean;
  monthlyCount: number;
  maxMonthlyTransactions: number | null;
  onUpdate: (id: string, data: Partial<{
    type: TransactionType; amount: number;
    category: TransactionCategory; description?: string; date: string;
  }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
  onUpgrade: () => void;
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function TransactionList({
  transactions, currency, isPro, monthlyCount, maxMonthlyTransactions,
  onUpdate, onDelete, onAdd, onUpgrade,
}: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date + 'T00:00:00');
      if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, selectedMonth, selectedYear, filterType, filterCategory]);

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const atLimit = maxMonthlyTransactions !== null && monthlyCount >= maxMonthlyTransactions;

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <div className="space-y-4 tab-enter">
      {atLimit && (
        <button
          onClick={onUpgrade}
          className="w-full card border-pro/30 bg-pro/5 flex items-center justify-between gap-3 text-left hover:border-pro transition-colors"
        >
          <div>
            <p className="text-pro text-sm font-semibold flex items-center gap-1.5">
              <Sparkles size={14} />
              Límite de {maxMonthlyTransactions} transacciones alcanzado
            </p>
            <p className="text-muted text-xs mt-0.5">Activá Plan Pro para transacciones ilimitadas.</p>
          </div>
          <span className="text-pro text-xs font-bold whitespace-nowrap">Ver planes →</span>
        </button>
      )}

      <div className="flex gap-2 items-center">
        <select
          value={selectedMonth}
          onChange={(e) => { setSelectedMonth(+e.target.value); setPage(0); }}
          className="input flex-1"
        >
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => { setSelectedYear(+e.target.value); setPage(0); }}
          className="input w-24"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'income', 'expense'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setFilterType(t); setPage(0); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterType === t
                ? 'border-income bg-income/10 text-income'
                : 'border-border text-muted hover:text-white hover:border-muted'
            }`}
          >
            {t === 'all' ? 'Todos' : t === 'income' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
          className="text-xs bg-surface border border-border text-muted rounded-full px-3 py-1.5"
        >
          <option value="">Todas las categorías</option>
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <button
        onClick={atLimit ? onUpgrade : onAdd}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Nueva transacción
      </button>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center">
            <ArrowLeftRight size={26} className="text-muted" />
          </div>
          <div>
            <p className="text-white font-semibold">Sin movimientos en {MONTHS[selectedMonth]}</p>
            <p className="text-muted text-sm mt-1">
              Todavía no cargaste ningún movimiento este mes. Empezá agregando tu primer gasto o ingreso.
            </p>
          </div>
          <button onClick={onAdd} className="btn-primary flex items-center gap-1.5 mt-1">
            <Plus size={15} />
            Agregar movimiento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((t) => (
            <div key={t.id} className="card flex items-center justify-between gap-3 hover:border-muted/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#8b8b93' }}
                />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.category}</p>
                  {t.description && <p className="text-muted text-xs truncate">{t.description}</p>}
                  <p className="text-muted text-xs">{formatDate(t.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`amount font-semibold text-sm ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </span>
                <button
                  onClick={() => setEditTx(t)}
                  className="text-muted hover:text-white p-1 rounded-lg hover:bg-border transition-colors"
                  aria-label="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-muted hover:text-expense p-1 rounded-lg hover:bg-expense/10 transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary text-sm p-2"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-muted text-sm">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary text-sm p-2"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {editTx && (
        <TransactionForm
          currency={currency}
          isPro={isPro}
          initialValues={{ ...editTx, description: editTx.description ?? undefined }}
          onSubmit={async (data) => { await onUpdate(editTx.id, data); }}
          onClose={() => setEditTx(null)}
        />
      )}
    </div>
  );
}
