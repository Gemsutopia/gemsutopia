'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Currency = 'USD' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  formatPriceNoSuffix: (price: number) => string;
  formatPriceRaw: (price: number) => string;
  exchangeRate: number;
  isLoadingRate: boolean;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isClient, setIsClient] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.70); // Fallback rate (1 CAD = ~0.70 USD)
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch live exchange rate from frankfurter.app (free, no API key needed)
  const fetchExchangeRate = useCallback(async () => {
    try {
      // Check localStorage cache first
      try {
        const cached = localStorage.getItem('exchangeRateCache');
        if (cached) {
          const { rate, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < CACHE_DURATION) {
            setExchangeRate(rate);
            setLastUpdated(new Date(timestamp));
            return;
          }
        }
      } catch {
        // localStorage not available or invalid cache, continue to fetch
      }

      setIsLoadingRate(true);

      // Fetch CAD to USD rate with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=CAD&to=USD', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        const rate = data.rates?.USD;

        if (rate && typeof rate === 'number') {
          setExchangeRate(rate);
          setLastUpdated(new Date());

          // Cache the rate
          try {
            localStorage.setItem('exchangeRateCache', JSON.stringify({
              rate,
              timestamp: Date.now(),
            }));
          } catch {
            // localStorage not available, skip caching
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch {
      // Keep using fallback rate silently
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch exchange rate on mount
  useEffect(() => {
    if (!isClient) return;
    fetchExchangeRate();
  }, [isClient, fetchExchangeRate]);

  // Fetch site default currency and load from localStorage on mount (client only)
  useEffect(() => {
    if (!isClient) return;

    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && ['USD', 'CAD'].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, [isClient]);

  // Save to localStorage whenever currency changes (client only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('currency', currency);
  }, [currency, isClient]);

  const convertPrice = (price: number): number => {
    if (currency === 'USD') {
      return price * exchangeRate;
    }
    return price; // CAD is base currency
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    return `$${convertedPrice.toFixed(2)} ${currency}`;
  };

  const formatPriceNoSuffix = (price: number): string => {
    const convertedPrice = convertPrice(price);
    return `$${convertedPrice.toFixed(2)}`;
  };

  // Format price without conversion (for values already in correct currency like shipping)
  const formatPriceRaw = (price: number): string => {
    return `$${price.toFixed(2)} ${currency}`;
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        convertPrice,
        formatPrice,
        formatPriceNoSuffix,
        formatPriceRaw,
        exchangeRate,
        isLoadingRate,
        lastUpdated,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
