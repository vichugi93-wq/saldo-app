export const PAYMENT_INFO = {
  bankName: 'Ueno Bank',
  accountNumber: '6192783875',
  accountHolder: 'Victor Ferreira',
  cci: '',
  alias: 'CI: 5315254',
  instructions: 'Incluí tu email como referencia del pago para que podamos identificar tu transferencia.',
  prices: {
    pro: { usd: 4, label: '$4 USD / mes' },
    family: { usd: 8, label: '$8 USD / mes' },
  },
} as const;
