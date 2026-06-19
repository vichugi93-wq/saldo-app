import { useState, FormEvent } from 'react';
import { TransactionType, TransactionCategory } from '../types/transaction';
import { CurrencyCode } from '../types/currency';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { getCurrencySymbol } from '../utils/currencies';
import { todayISO } from '../utils/formatters';

interface ParsedTx {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

interface Props {
  currency: CurrencyCode;
  isPro: boolean;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: TransactionCategory;
    description?: string;
    date: string;
  }) => Promise<void>;
  onInterpret?: (text: string) => Promise<ParsedTx | null>;
  onClose: () => void;
  initialValues?: Partial<{
    type: TransactionType;
    amount: number;
    category: TransactionCategory;
    description: string;
    date: string;
  }>;
}

export function TransactionForm({ currency, isPro, onSubmit, onInterpret, onClose, initialValues }: Props) {
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 'expense');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '');
  const [category, setCategory] = useState<TransactionCategory>(
    initialValues?.category ?? (type === 'expense' ? 'Alimentación' : 'Salario'),
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.date ?? todayISO());
  const [freeText, setFreeText] = useState('');
  const [interpreting, setInterpreting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFreeText, setShowFreeText] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const symbol = getCurrencySymbol(currency);

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === 'expense' ? 'Alimentación' : 'Salario');
  };

  const handleInterpret = async () => {
    if (!onInterpret || !freeText.trim()) return;
    setInterpreting(true);
    try {
      const result = await onInterpret(freeText);
      if (result) {
        setType(result.type);
        setAmount(result.amount.toString());
        setCategory(result.category as TransactionCategory);
        setDescription(result.description);
        setShowFreeText(false);
        setFreeText('');
      }
    } finally {
      setInterpreting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(',', '.'));
    if (!amt || amt <= 0) { setError('Ingresá un monto válido.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ type, amount: amt, category, description: description || undefined, date });
      onClose();
    } catch {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-5 fade-in space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Nueva transacción</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-expense text-white' : 'text-muted hover:text-white'}`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${type === 'income' ? 'bg-income text-black' : 'text-muted hover:text-white'}`}
          >
            Ingreso
          </button>
        </div>

        {isPro && (
          <div>
            <button
              type="button"
              onClick={() => setShowFreeText(!showFreeText)}
              className="text-income text-xs flex items-center gap-1 hover:text-green-400 transition-colors"
            >
              ✨ {showFreeText ? 'Ocultar' : 'Pegar texto libre (IA interpreta)'}
            </button>
            {showFreeText && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder='Ej: "Almuerzo con el equipo 85.000" o "Salario enero 3.500.000"'
                />
                <button
                  type="button"
                  onClick={handleInterpret}
                  disabled={interpreting || !freeText.trim()}
                  className="btn-primary text-sm py-1.5 w-full"
                >
                  {interpreting ? 'Interpretando...' : 'Interpretar con IA'}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Monto ({symbol})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder={`0`}
              min="0"
              step="any"
              required
            />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="input"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="¿En qué fue?"
            />
          </div>
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>
          {error && <p className="text-expense text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
