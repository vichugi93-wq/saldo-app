import {
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../../types/transaction';
import { CurrencyCode } from '../../types/currency';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
}

export function NetBalanceLineChart({ transactions, currency }: Props) {
  const now = new Date();
  const data = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
    const monthTxs = transactions.filter((t) => {
      const td = new Date(t.date + 'T00:00:00');
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { month: formatMonthYear(d).slice(0, 3) + ' ' + d.getFullYear(), net: income - expense };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
          tickFormatter={(v: number) => {
            const f = formatCurrency(Math.abs(v), currency);
            return (v < 0 ? '-' : '') + f.split(' ')[1]?.slice(0, 6);
          }}
        />
        <Tooltip
          formatter={(val: number) => [formatCurrency(val, currency), 'Saldo neto']}
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  );
}
