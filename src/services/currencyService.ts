// Service to fetch exchange rates from open.er-api.com
export const SUPPORTED_CURRENCIES = [
  'RUB', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'PLN', 'TRY'
];

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
}

export async function fetchRates(base: string): Promise<CurrencyRates> {
  if (!SUPPORTED_CURRENCIES.includes(base)) {
    throw new Error('Unsupported currency');
  }
  const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!res.ok) throw new Error('Failed to fetch rates');
  const data = await res.json();
  if (data.result !== 'success') throw new Error('API error');
  // Filter only supported currencies
  const filteredRates: Record<string, number> = {};
  for (const cur of SUPPORTED_CURRENCIES) {
    if (data.rates[cur]) filteredRates[cur] = data.rates[cur];
  }
  return { base, rates: filteredRates };
} 