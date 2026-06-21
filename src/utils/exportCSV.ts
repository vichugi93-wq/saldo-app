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
  const montoFmt = `"${symbol} "#,##0`;

  const now = new Date();
  const fechaReporte = now.toLocaleDateString('es-PY', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Movimientos ──────────────────────────────────────────────────
  const HEADER_ROWS = 5; // filas de cabecera antes de los datos

  const txRows: (string | number)[][] = [
    // Cabecera
    ['SALDO', '', '', '', ''],
    ['Reporte de Finanzas Personales', '', '', '', ''],
    [`Generado el ${fechaReporte}`, '', '', `Moneda: ${symbol}`, ''],
    [`Total de movimientos: ${transactions.length}`, '', '', '', ''],
    [],
    // Columnas
    ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'],
    // Datos
    ...sorted.map((t) => [
      new Date(t.date).toLocaleDateString('es-PY'),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.category,
      t.description ?? '',
      t.amount,
    ]),
    // Totales
    [],
    ['', '', '', 'Total ingresos', totalIncome],
    ['', '', '', 'Total gastos',   totalExpense],
    ['', '', '', 'Saldo neto',     netBalance],
  ];

  const ws = XLSX.utils.aoa_to_sheet(txRows);

  // Merge celdas para el título "SALDO" (fila 0, columnas A-E)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // SALDO
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Reporte de Finanzas
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Fecha generado
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // Total movimientos
  ];

  ws['!cols'] = [
    { wch: 14 }, // Fecha
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoría
    { wch: 30 }, // Descripción
    { wch: 18 }, // Monto
  ];

  // Altura de filas de cabecera
  ws['!rows'] = [
    { hpt: 28 }, // fila 1: SALDO
    { hpt: 18 }, // fila 2: subtítulo
    { hpt: 15 }, // fila 3: fecha
    { hpt: 15 }, // fila 4: total movimientos
    { hpt: 8  }, // fila 5: espacio vacío
    { hpt: 18 }, // fila 6: encabezados de columna
  ];

  // Formato numérico columna Monto en filas de datos y totales
  const dataRows = sorted.length;
  for (let r = HEADER_ROWS + 1; r <= HEADER_ROWS + 1 + dataRows + 3; r++) {
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
    ['SALDO', '', '', ''],
    ['Resumen por Categoría', '', '', ''],
    [`Generado el ${fechaReporte}`, '', '', ''],
    [],
    ['Categoría', 'Ingresos', 'Gastos', 'Neto'],
    ...Object.entries(categoryTotals)
      .sort((a, b) => (b[1].expense + b[1].income) - (a[1].expense + a[1].income))
      .map(([cat, { income, expense }]) => [cat, income, expense, income - expense]),
    [],
    ['TOTAL', totalIncome, totalExpense, netBalance],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
  ];
  ws2['!rows'] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 15 }, { hpt: 8 }, { hpt: 18 }];

  const summaryDataRows = Object.keys(categoryTotals).length;
  for (let r = 5; r <= 5 + summaryDataRows + 1; r++) {
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
  const date = now.toISOString().slice(0, 10);
  XLSX.writeFile(wb, `saldo-${label}-${date}.xlsx`);
}

export function currentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}
