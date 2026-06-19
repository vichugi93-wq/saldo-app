import {
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../../types/transaction';
import { CurrencyCode } from '../../types/currency';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
}

function getWeekLabel(date: Date): string {
  const day = date.getDate();
  if (day <= 7) return 'Sem 1';
  if (day <= 14) return 'Sem 2';
  if (day <= 21) return 'Sem 3';
  return 'Sem 4';
}

export function IncomeExpenseBarChart({ transactions, currency }: Props) {
  const now = new Date();
  const monthly = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const data = weeks.map((week) => {
    const weekTxs = monthly.filter((t) => getWeekLabel(new Date(t.date + 'T00:00:00')) === week);
    return {
      week,
      Ingresos: weekTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      Gastos: weekTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsBar data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, currency).split(' ')[0] + ' ' + formatCurrency(v, currency).split(' ')[1]?.slice(0, 4)} width={60} />
        <Tooltip
          formatter={(val: number, name: string) => [formatCurrency(val, currency), name]}
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend formatter={(val) => <span className="text-xs text-muted">{val}</span>} iconSize={10} />
        <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
