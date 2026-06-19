export type CurrencyCode =
  | 'PYG' | 'ARS' | 'USD' | 'BRL' | 'UYU'
  | 'CLP' | 'COP' | 'MXN' | 'PEN' | 'BOB' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
}
