import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types/transaction';
import { CurrencyCode } from '../../types/currency';
import { CATEGORY_COLORS } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
}

export function ExpensePieChart({ transactions, currency }: Props) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const byCategory = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});

  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-muted text-sm">Sin gastos este mes</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#71717a'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val: number) => [formatCurrency(val, currency), '']}
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend
          formatter={(val) => <span className="text-xs text-muted">{val}</span>}
          iconSize={10}
        />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
