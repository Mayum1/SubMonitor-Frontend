import { CurrencyRates } from '../services/currencyService';

// Default rates as of March 2024 (will be used as fallback)
const DEFAULT_RATES: Record<string, Record<string, number>> = {
  RUB: {
    USD: 0.013,
    EUR: 0.011,
    JPY: 1.80,
    GBP: 0.009,
    CNY: 0.09,
    PLN: 0.047,
    TRY: 0.49,
    RUB: 1
  },
  USD: {
    RUB: 79.7,
    EUR: 0.89,
    JPY: 143.8,
    GBP: 0.75,
    CNY: 7.2,
    PLN: 3.76,
    TRY: 39.0,
    USD: 1
  },
  EUR: {
    RUB: 89.97,
    USD: 1.13,
    JPY: 162.3,
    GBP: 0.84,
    CNY: 8.14,
    PLN: 4.25,
    TRY: 44.03,
    EUR: 1
  }
};

export const getLocale = (currency: string): string => {
  switch (currency) {
    case 'RUB': return 'ru-RU';
    case 'USD': return 'en-US';
    case 'EUR': return 'de-DE';
    case 'JPY': return 'ja-JP';
    case 'GBP': return 'en-GB';
    case 'CNY': return 'zh-CN';
    case 'PLN': return 'pl-PL';
    case 'TRY': return 'tr-TR';
    default: return 'en-US';
  }
};

export const convertAmount = (amount: number, from: string, to: string, rates: CurrencyRates | null): number => {
  if (from === to) return amount;
  
  // Try to use live rates first
  if (rates) {
    if (rates.base === from && rates.rates[to]) {
      return amount * rates.rates[to];
    }
    if (rates.base === to && rates.rates[from]) {
      return amount / rates.rates[from];
    }
    if (rates.rates[from] && rates.rates[to]) {
      return amount / rates.rates[from] * rates.rates[to];
    }
  }
  
  // Fallback to default rates
  const defaultRates = DEFAULT_RATES[from] || DEFAULT_RATES['USD'];
  if (defaultRates[to]) {
    return amount * defaultRates[to];
  }
  
  return amount;
};

export const formatCurrency = (amount: number, currency: string, originalCurrency = 'RUB', rates: CurrencyRates | null): string => {
  const converted = convertAmount(amount, originalCurrency, currency, rates);
  return new Intl.NumberFormat(getLocale(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(converted);
}; 