// Free address validation using OpenStreetMap Nominatim API and local validation

export interface ValidationResult {
  isValid: boolean;
  formattedAddress?: string;
  components?: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    administrativeAreaLevel1?: string;
    postalCode?: string;
    country?: string;
  };
  error?: string;
  suggestions?: string[];
}

export interface AddressData {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Canadian postal code pattern
const CANADIAN_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
// US zip code patterns
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

// Free address validation using server-side API route
export async function validateAddress(addressData: AddressData): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/address-validation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`Address validation API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch {
    // Fall back to local validation if API fails
    return validateAddressLocally(addressData);
  }
}

// Local validation fallback (when API is unavailable)
function validateAddressLocally(addressData: AddressData): ValidationResult {
  const errors: string[] = [];

  // Validate postal code
  const postalValidation = validatePostalCode(addressData.zipCode, addressData.country);
  if (!postalValidation.isValid) {
    errors.push(postalValidation.error!);
  }

  // Basic address validation
  if (!addressData.address || addressData.address.length < 5) {
    errors.push('Street address appears to be too short');
  }

  if (!addressData.city || addressData.city.length < 2) {
    errors.push('City name appears to be invalid');
  }

  // Validate state/province for known locations
  if (addressData.country === 'Canada') {
    const validProvinces = [
      'AB',
      'BC',
      'MB',
      'NB',
      'NL',
      'NT',
      'NS',
      'NU',
      'ON',
      'PE',
      'QC',
      'SK',
      'YT',
    ];
    if (!validProvinces.includes(addressData.state)) {
      errors.push('Invalid Canadian province code');
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('. '),
    };
  }

  return {
    isValid: true,
    formattedAddress: `${addressData.address}${addressData.apartment ? `, ${addressData.apartment}` : ''}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}, ${addressData.country}`,
  };
}

// Validate postal/zip code format
function validatePostalCode(
  postalCode: string,
  country: string
): { isValid: boolean; error?: string } {
  if (!postalCode) {
    return { isValid: false, error: 'Postal/Zip code is required' };
  }

  if (country === 'Canada') {
    if (!CANADIAN_POSTAL_REGEX.test(postalCode)) {
      return {
        isValid: false,
        error: 'Invalid Canadian postal code format. Use format: A1A 1A1',
      };
    }
  } else if (country === 'United States') {
    if (!US_ZIP_REGEX.test(postalCode)) {
      return {
        isValid: false,
        error: 'Invalid US zip code format. Use format: 12345 or 12345-6789',
      };
    }
  }

  return { isValid: true };
}

// Get user's approximate location for default country/state
export async function getUserLocation(): Promise<{ country: string; state: string } | null> {
  try {
    // Use ipapi.co (free IP geolocation)
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name || 'Canada',
        state: data.region_code || '',
      };
    }
  } catch {
    // Failed to get user location
  }
  return null;
}

// Address suggestions using server-side API route
export async function getAddressSuggestions(
  query: string,
  country: 'Canada' | 'United States' = 'Canada'
): Promise<string[]> {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      country: country,
    });

    const response = await fetch(`/api/address-suggestions?${params}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}
