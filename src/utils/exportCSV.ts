import * as XLSX from 'xlsx';
import { Transaction } from '../types/transaction';
import { getCurrency } from './currencies';
import { CurrencyCode } from '../types/currency';

export function exportTransactionsCSV(
  transactions: Transaction[],
  currency: CurrencyCode,
  label = 'todos',
) {
  const { symbol } = getCurrency(currency);

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Movimientos ──────────────────────────────────────────────────
  const txRows: (string | number)[][] = [
    ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'],
    ...sorted.map((t) => [
      new Date(t.date).toLocaleDateString('es-PY'),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.category,
      t.description ?? '',
      t.amount,
    ]),
    [],
    ['', '', '', 'Total ingresos', totalIncome],
    ['', '', '', 'Total gastos',   totalExpense],
    ['', '', '', 'Saldo neto',     netBalance],
  ];

  const ws = XLSX.utils.aoa_to_sheet(txRows);

  // Anchos de columna
  ws['!cols'] = [
    { wch: 14 }, // Fecha
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoría
    { wch: 30 }, // Descripción
    { wch: 18 }, // Monto
  ];

  // Formato numérico para columna Monto (E) — usa símbolo de la moneda
  const montoFmt = `"${symbol} "#,##0`;
  const dataRows = sorted.length;
  for (let r = 1; r <= dataRows + 3; r++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c: 4 })];
    if (cell && typeof cell.v === 'number') {
      cell.t = 'n';
      cell.z = montoFmt;
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

  // ── Hoja 2: Resumen por categoría ────────────────────────────────────────
  const categoryTotals: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    if (!categoryTotals[t.category]) categoryTotals[t.category] = { income: 0, expense: 0 };
    if (t.type === 'income') categoryTotals[t.category].income += t.amount;
    else categoryTotals[t.category].expense += t.amount;
  }

  const summaryRows: (string | number)[][] = [
    ['Categoría', 'Ingresos', 'Gastos', 'Neto'],
    ...Object.entries(categoryTotals)
      .sort((a, b) => (b[1].expense + b[1].income) - (a[1].expense + a[1].income))
      .map(([cat, { income, expense }]) => [cat, income, expense, income - expense]),
    [],
    ['TOTAL', totalIncome, totalExpense, netBalance],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];

  // Formato numérico columnas B, C, D en hoja resumen
  const summaryDataRows = Object.keys(categoryTotals).length;
  for (let r = 1; r <= summaryDataRows + 1; r++) {
    for (let c = 1; c <= 3; c++) {
      const cell = ws2[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'number') {
        cell.t = 'n';
        cell.z = montoFmt;
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws2, 'Por categoría');

  // ── Descarga ─────────────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `saldo-${label}-${date}.xlsx`);
}

export function currentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}
