/**
 * Dynamic Shipping Calculator
 * Handles zone-based shipping rates (Canada vs USA) with combined shipping logic
 */

export type ShippingZone = 'canada' | 'usa';

export interface ShippingSettings {
  enableShipping: boolean;
  internationalShipping: boolean;
  singleItemShippingCAD: number;
  singleItemShippingUSD: number;
  combinedShippingCAD: number;
  combinedShippingUSD: number;
  combinedShippingEnabled: boolean;
  combinedShippingThreshold: number;
}

export interface ShippingCalculation {
  shippingCost: number;
  currency: 'CAD' | 'USD';
  zone: ShippingZone;
  isCombinedShipping: boolean;
  itemCount: number;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

/**
 * Determine shipping zone from destination country
 */
export function getShippingZone(country: string): ShippingZone {
  const normalizedCountry = country.toLowerCase().trim();

  // Canada variations
  if (
    normalizedCountry === 'canada' ||
    normalizedCountry === 'ca' ||
    normalizedCountry === 'can'
  ) {
    return 'canada';
  }

  // USA variations
  if (
    normalizedCountry === 'united states' ||
    normalizedCountry === 'usa' ||
    normalizedCountry === 'us' ||
    normalizedCountry === 'united states of america' ||
    normalizedCountry === 'america'
  ) {
    return 'usa';
  }

  // Default to USA for international (since USD rates are typically for non-Canada)
  return 'usa';
}

/**
 * Get the currency for a shipping zone
 */
export function getZoneCurrency(zone: ShippingZone): 'CAD' | 'USD' {
  return zone === 'canada' ? 'CAD' : 'USD';
}

/**
 * Calculate shipping cost based on cart items, destination zone, and shipping settings
 * Zone determines the rate (Canada = CAD rates, USA = USD rates)
 * Display currency is separate - for showing the price in user's preferred currency
 */
export function calculateShipping(
  itemCount: number,
  currency: 'CAD' | 'USD',
  settings: ShippingSettings,
  destinationCountry?: string
): ShippingCalculation {
  // Determine zone from destination country, or fall back to currency-based logic
  const zone: ShippingZone = destinationCountry
    ? getShippingZone(destinationCountry)
    : (currency === 'CAD' ? 'canada' : 'usa');

  // If shipping is disabled, return zero cost
  if (!settings.enableShipping) {
    return {
      shippingCost: 0,
      currency,
      zone,
      isCombinedShipping: false,
      itemCount,
      breakdown: [{ description: 'Free shipping', amount: 0 }],
    };
  }

  // No items, no shipping
  if (itemCount === 0) {
    return {
      shippingCost: 0,
      currency,
      zone,
      isCombinedShipping: false,
      itemCount,
      breakdown: [],
    };
  }

  const isCombinedShipping =
    settings.combinedShippingEnabled && itemCount >= settings.combinedShippingThreshold;

  let shippingCost: number;
  let description: string;

  // Use zone to determine which rate to apply (not display currency)
  const useCanadaRates = zone === 'canada';

  if (isCombinedShipping) {
    // Use combined shipping rate based on destination zone
    shippingCost = useCanadaRates ? settings.combinedShippingCAD : settings.combinedShippingUSD;
    description = `Combined shipping for ${itemCount} items (${zone === 'canada' ? 'Canada' : 'USA'})`;
  } else {
    // Use single item shipping rate based on destination zone
    const singleRate = useCanadaRates
      ? settings.singleItemShippingCAD
      : settings.singleItemShippingUSD;
    shippingCost = singleRate * itemCount;
    description =
      itemCount === 1
        ? `Standard shipping for 1 item (${zone === 'canada' ? 'Canada' : 'USA'})`
        : `Standard shipping for ${itemCount} items (${formatCurrency(singleRate, useCanadaRates ? 'CAD' : 'USD')} each)`;
  }

  return {
    shippingCost,
    currency: useCanadaRates ? 'CAD' : 'USD', // Return the zone's native currency
    zone,
    isCombinedShipping,
    itemCount,
    breakdown: [{ description, amount: shippingCost }],
  };
}

/**
 * Get shipping rate preview for settings display
 * Shows rates by zone (Canada vs USA)
 */
export function getShippingRatePreview(settings: ShippingSettings) {
  const examples = [
    {
      itemCount: 1,
      canadaRate: calculateShipping(1, 'CAD', settings, 'Canada'),
      usaRate: calculateShipping(1, 'USD', settings, 'United States'),
    },
    {
      itemCount: 5,
      canadaRate: calculateShipping(5, 'CAD', settings, 'Canada'),
      usaRate: calculateShipping(5, 'USD', settings, 'United States'),
    },
    {
      itemCount: 10,
      canadaRate: calculateShipping(10, 'CAD', settings, 'Canada'),
      usaRate: calculateShipping(10, 'USD', settings, 'United States'),
    },
  ];

  return examples;
}

/**
 * Validate shipping settings
 */
export function validateShippingSettings(settings: Partial<ShippingSettings>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (settings.singleItemShippingCAD !== undefined && settings.singleItemShippingCAD < 0) {
    errors.push('Single item shipping rate (CAD) cannot be negative');
  }

  if (settings.singleItemShippingUSD !== undefined && settings.singleItemShippingUSD < 0) {
    errors.push('Single item shipping rate (USD) cannot be negative');
  }

  if (settings.combinedShippingCAD !== undefined && settings.combinedShippingCAD < 0) {
    errors.push('Combined shipping rate (CAD) cannot be negative');
  }

  if (settings.combinedShippingUSD !== undefined && settings.combinedShippingUSD < 0) {
    errors.push('Combined shipping rate (USD) cannot be negative');
  }

  if (settings.combinedShippingThreshold !== undefined && settings.combinedShippingThreshold < 2) {
    errors.push('Combined shipping threshold must be at least 2 items');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: 'CAD' | 'USD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Convert CAD to USD or vice versa using live exchange rates
 * Falls back to static rate if API fails
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: 'CAD' | 'USD',
  toCurrency: 'CAD' | 'USD'
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    // Try to get live exchange rate from your existing crypto-prices API
    const response = await fetch('/api/crypto-prices');
    const data = await response.json();

    if (data.success && data.exchangeRates) {
      const rate =
        fromCurrency === 'CAD' ? data.exchangeRates.CAD_TO_USD : data.exchangeRates.USD_TO_CAD;

      if (rate && rate > 0) {
        return parseFloat((amount * rate).toFixed(2));
      }
    }
  } catch {
    // Failed to fetch live exchange rate, using fallback
  }

  // Fallback to approximate exchange rates
  const fallbackRates = {
    CAD_TO_USD: 0.74,
    USD_TO_CAD: 1.35,
  };

  const rate = fromCurrency === 'CAD' ? fallbackRates.CAD_TO_USD : fallbackRates.USD_TO_CAD;

  return parseFloat((amount * rate).toFixed(2));
}

/**
 * Get shipping rates in both currencies for display
 */
export async function getShippingRatesInBothCurrencies(
  itemCount: number,
  settings: ShippingSettings
): Promise<{
  cad: ShippingCalculation;
  usd: ShippingCalculation;
  convertedFromCAD?: boolean;
  convertedFromUSD?: boolean;
}> {
  const cadRate = calculateShipping(itemCount, 'CAD', settings);
  const usdRate = calculateShipping(itemCount, 'USD', settings);

  // Convert CAD settings to USD dynamically if needed
  const convertedUSDCost = await convertCurrency(cadRate.shippingCost, 'CAD', 'USD');
  const convertedCADCost = await convertCurrency(usdRate.shippingCost, 'USD', 'CAD');

  return {
    cad: cadRate,
    usd: {
      ...usdRate,
      shippingCost: convertedUSDCost,
    },
    convertedFromCAD: Math.abs(convertedUSDCost - usdRate.shippingCost) > 0.01,
    convertedFromUSD: Math.abs(convertedCADCost - cadRate.shippingCost) > 0.01,
  };
}

/**
 * Get shipping settings from API (for client-side use)
 */
export async function fetchShippingSettings(): Promise<ShippingSettings | null> {
  try {
    const response = await fetch('/api/shipping-settings');
    if (!response.ok) {
      throw new Error('Failed to fetch shipping settings');
    }

    const data = await response.json();
    return data.settings;
  } catch {
    return null;
  }
}

/**
 * API endpoint to get shipping settings (public, no auth needed)
 * These defaults should match the current admin panel settings
 */
export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  enableShipping: true,
  internationalShipping: true,
  singleItemShippingCAD: 21.0,
  singleItemShippingUSD: 15.0,
  combinedShippingCAD: 25.0,
  combinedShippingUSD: 18.0,
  combinedShippingEnabled: true,
  combinedShippingThreshold: 2,
};
