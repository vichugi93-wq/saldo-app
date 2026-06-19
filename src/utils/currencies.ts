import { Currency, CurrencyCode } from '../types/currency';

export const CURRENCIES: Currency[] = [
  { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/.' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export const getCurrency = (code: CurrencyCode): Currency =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

export const getCurrencySymbol = (code: CurrencyCode): string =>
  getCurrency(code).symbol;
