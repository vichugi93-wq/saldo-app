import { CurrencyCode } from '../types/currency';
import { getCurrencySymbol } from './currencies';

const NO_DECIMALS: CurrencyCode[] = ['PYG', 'ARS', 'CLP', 'COP'];

export function formatCurrency(amount: number, code: CurrencyCode): string {
  if (code === 'BRL') {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (NO_DECIMALS.includes(code)) {
    return `${getCurrencySymbol(code)} ${Math.round(amount).toLocaleString('es-PY')}`;
  }
  return `${getCurrencySymbol(code)} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

export function monthEndISO(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
}
