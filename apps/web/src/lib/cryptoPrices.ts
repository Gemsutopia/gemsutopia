interface CryptoPrices {
  bitcoin: { usd: number; cad: number };
  ethereum: { usd: number; cad: number };
  solana: { usd: number; cad: number };
  'usd-coin': { usd: number; cad: number };
  litecoin: { usd: number; cad: number };
  dogecoin: { usd: number; cad: number };
}

interface CryptoPriceResponse {
  success: boolean;
  data: {
    prices: CryptoPrices;
    exchangeRates: {
      CAD_TO_USD: number;
      USD_TO_CAD: number;
    };
    timestamp: string;
    fromCache?: boolean;
    isFallback?: boolean;
  };
}

// Supported crypto symbols mapped to CoinGecko IDs
export const CRYPTO_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
  LTC: 'litecoin',
  DOGE: 'dogecoin',
} as const;

export type CryptoSymbol = keyof typeof CRYPTO_MAP;

export async function fetchCryptoPrices(): Promise<CryptoPrices> {
  try {
    const response = await fetch('/api/crypto-prices', {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CryptoPriceResponse = await response.json();

    if (result.success && result.data?.prices) {
      return result.data.prices;
    }

    throw new Error('Invalid response format');
  } catch {
    // Fallback to approximate prices if API fails
    return {
      bitcoin: { usd: 100000, cad: 140000 },
      ethereum: { usd: 3500, cad: 4900 },
      solana: { usd: 180, cad: 250 },
      'usd-coin': { usd: 1, cad: 1.4 },
      litecoin: { usd: 120, cad: 168 },
      dogecoin: { usd: 0.35, cad: 0.49 },
    };
  }
}

export function calculateCryptoAmount(
  fiatAmount: number,
  cryptoSymbol: CryptoSymbol,
  currency: 'USD' | 'CAD',
  prices: CryptoPrices
): number {
  const currencyKey = currency.toLowerCase() as 'usd' | 'cad';
  const coinId = CRYPTO_MAP[cryptoSymbol];

  const price = prices[coinId]?.[currencyKey];
  if (!price || price === 0) {
    throw new Error(`Price not available for ${cryptoSymbol}`);
  }

  return fiatAmount / price;
}

export function formatCryptoAmount(amount: number, symbol: CryptoSymbol): string {
  // Different precision for different cryptos
  switch (symbol) {
    case 'BTC':
      return amount.toFixed(8); // Satoshi precision
    case 'ETH':
    case 'SOL':
    case 'LTC':
      return amount.toFixed(6);
    case 'USDC':
      return amount.toFixed(2); // Stablecoin, 2 decimals
    case 'DOGE':
      return amount.toFixed(4);
    default:
      return amount.toFixed(6);
  }
}

export function getCryptoDisplayName(symbol: CryptoSymbol): string {
  const names: Record<CryptoSymbol, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    SOL: 'Solana',
    USDC: 'USD Coin',
    LTC: 'Litecoin',
    DOGE: 'Dogecoin',
  };
  return names[symbol];
}
