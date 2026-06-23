import { apiSuccess } from '@/lib/api';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Extended crypto prices with more coins supported by Coinbase Commerce
interface CryptoPrices {
  bitcoin: { usd: number; cad: number };
  ethereum: { usd: number; cad: number };
  solana: { usd: number; cad: number };
  'usd-coin': { usd: number; cad: number };
  litecoin: { usd: number; cad: number };
  dogecoin: { usd: number; cad: number };
}

interface CachedPriceData {
  prices: CryptoPrices;
  exchangeRates: {
    CAD_TO_USD: number;
    USD_TO_CAD: number;
  };
  timestamp: string;
}

// Fallback prices (updated periodically)
const FALLBACK_PRICES: CryptoPrices = {
  bitcoin: { usd: 100000, cad: 140000 },
  ethereum: { usd: 3500, cad: 4900 },
  solana: { usd: 180, cad: 250 },
  'usd-coin': { usd: 1, cad: 1.4 },
  litecoin: { usd: 120, cad: 168 },
  dogecoin: { usd: 0.35, cad: 0.49 },
};

export async function GET() {
  try {
    // Try to get from Redis cache first
    const cached = await getCache<CachedPriceData>(CACHE_KEYS.CRYPTO_PRICES);
    if (cached) {
      return apiSuccess({
        ...cached,
        fromCache: true,
      });
    }

    // Fetch fresh prices from CoinGecko
    const coins = 'bitcoin,ethereum,solana,usd-coin,litecoin,dogecoin';
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=usd,cad`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Don't use Next.js cache since we're using Redis
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CryptoPrices = await response.json();

    // Calculate exchange rates from Bitcoin prices (most stable)
    const cadToUsdRate = data.bitcoin.usd / data.bitcoin.cad;
    const usdToCadRate = data.bitcoin.cad / data.bitcoin.usd;

    const priceData: CachedPriceData = {
      prices: data,
      exchangeRates: {
        CAD_TO_USD: parseFloat(cadToUsdRate.toFixed(4)),
        USD_TO_CAD: parseFloat(usdToCadRate.toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    };

    // Cache the result in Redis
    await setCache(CACHE_KEYS.CRYPTO_PRICES, priceData, CACHE_TTL.CRYPTO_PRICES);

    return apiSuccess({
      ...priceData,
      fromCache: false,
    });
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);

    // Return fallback prices if API fails
    const fallbackData: CachedPriceData = {
      prices: FALLBACK_PRICES,
      exchangeRates: {
        CAD_TO_USD: 0.71,
        USD_TO_CAD: 1.4,
      },
      timestamp: new Date().toISOString(),
    };

    return apiSuccess({
      ...fallbackData,
      isFallback: true,
    });
  }
}
