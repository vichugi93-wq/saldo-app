export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Alimentación' | 'Transporte' | 'Salud' | 'Entretenimiento'
  | 'Ropa' | 'Hogar' | 'Educación' | 'Otros';

export type IncomeCategory =
  | 'Salario' | 'Freelance' | 'Negocio' | 'Inversiones' | 'Otros ingresos';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string | null;
  date: string;
  created_at: string;
}
