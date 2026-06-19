import { Transaction } from '../types/transaction';
import { getCurrency } from './currencies';
import { CurrencyCode } from '../types/currency';

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  currency: CurrencyCode,
  label = 'todos',
) {
  const { symbol } = getCurrency(currency);

  const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción'];

  const rows = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => [
      new Date(t.date).toLocaleDateString('es-PY'),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      escapeCSV(t.category),
      `${symbol} ${t.amount.toLocaleString('es-PY')}`,
      escapeCSV(t.description ?? ''),
    ]);

  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const summary = [
    [],
    ['Resumen', '', '', '', ''],
    ['Total ingresos', '', '', `${symbol} ${totalIncome.toLocaleString('es-PY')}`, ''],
    ['Total gastos',   '', '', `${symbol} ${totalExpense.toLocaleString('es-PY')}`, ''],
    ['Saldo neto',     '', '', `${symbol} ${(totalIncome - totalExpense).toLocaleString('es-PY')}`, ''],
  ];

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summary.map((r) => r.join(',')),
  ].join('\n');

  const bom  = '﻿'; // BOM para que Excel abra en UTF-8
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `saldo-${label}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function currentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}
