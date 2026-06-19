import { CurrencyCode } from '../types/currency';
import { CURRENCIES } from '../utils/currencies';

interface Props {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className = '' }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className={`input ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.name} ({c.code})
        </option>
      ))}
    </select>
  );
}
