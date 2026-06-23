import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface AddressData {
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

// Local validation fallback
function validateAddressLocally(addressData: AddressData) {
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

export async function POST(request: NextRequest) {
  try {
    const addressData: AddressData = await request.json();

    // First, validate postal/zip code format locally
    const postalValidation = validatePostalCode(addressData.zipCode, addressData.country);
    if (!postalValidation.isValid) {
      return apiSuccess({
        isValid: false,
        error: postalValidation.error,
      });
    }

    // Construct full address string
    const fullAddress = `${addressData.address}${addressData.apartment ? `, ${addressData.apartment}` : ''}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}, ${addressData.country}`;

    // Use OpenStreetMap Nominatim API (free, no API key required)
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
      q: fullAddress,
      format: 'json',
      limit: '1',
      addressdetails: '1',
      countrycodes: addressData.country === 'Canada' ? 'ca' : 'us',
    });

    const response = await fetch(`${nominatimUrl}?${params}`, {
      headers: {
        'User-Agent': 'GemSutopia/1.0 (contact@gemsutopia.com)',
      },
    });

    if (!response.ok) {
      // Fall back to local validation
      return apiSuccess(validateAddressLocally(addressData));
    }

    const results = await response.json();

    if (results && results.length > 0) {
      const result = results[0];
      const address = result.address || {};

      // Extract address components from Nominatim result
      const components = {
        streetNumber: address.house_number,
        route: address.road,
        locality: address.city || address.town || address.village,
        administrativeAreaLevel1: address.state || address.province,
        postalCode: address.postcode,
        country: address.country_code?.toUpperCase(),
      };

      // Basic validation - check if the city matches
      const cityMatch = address.city || address.town || address.village;
      const isReasonableMatch =
        cityMatch &&
        (cityMatch.toLowerCase().includes(addressData.city.toLowerCase()) ||
          addressData.city.toLowerCase().includes(cityMatch.toLowerCase()));

      if (!isReasonableMatch) {
        return apiSuccess({
          isValid: false,
          error: `Address not found in ${addressData.city}. ${cityMatch ? `Did you mean ${cityMatch}?` : 'Please check your city name.'}`,
          formattedAddress: result.display_name,
          suggestions: cityMatch ? [cityMatch] : [],
        });
      }

      return apiSuccess({
        isValid: true,
        formattedAddress: result.display_name,
        components: components,
      });
    } else {
      // If no results from API, fall back to local validation
      return apiSuccess(validateAddressLocally(addressData));
    }
  } catch {
    // Fall back to local validation
    try {
      const addressData: AddressData = await request.json();
      return apiSuccess(validateAddressLocally(addressData));
    } catch {
      return apiSuccess({
        isValid: false,
        error: 'Unable to validate address. Please ensure all fields are correct and try again.',
      });
    }
  }
}
