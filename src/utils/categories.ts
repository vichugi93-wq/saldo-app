import { ExpenseCategory, IncomeCategory } from '../types/transaction';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Alimentación', 'Transporte', 'Salud', 'Entretenimiento',
  'Ropa', 'Hogar', 'Educación', 'Otros',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salario', 'Freelance', 'Negocio', 'Inversiones', 'Otros ingresos',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentación: '#f97316',
  Transporte: '#3b82f6',
  Salud: '#ec4899',
  Entretenimiento: '#a855f7',
  Ropa: '#f59e0b',
  Hogar: '#06b6d4',
  Educación: '#10b981',
  Otros: '#71717a',
  Salario: '#22c55e',
  Freelance: '#84cc16',
  Negocio: '#14b8a6',
  Inversiones: '#6366f1',
  'Otros ingresos': '#71717a',
};
