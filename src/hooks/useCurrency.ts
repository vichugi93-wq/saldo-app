import { CurrencyCode } from '../types/currency';
import { getCurrency, getCurrencySymbol } from '../utils/currencies';
import { formatCurrency } from '../utils/formatters';

export function useCurrency(code: CurrencyCode) {
  const currency = getCurrency(code);
  const symbol = getCurrencySymbol(code);
  const format = (amount: number) => formatCurrency(amount, code);
  return { currency, symbol, format, code };
}
