import { NextRequest } from 'next/server';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');

    if (!placeId) {
      return ApiError.validation('place_id is required');
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return ApiError.internal('Google Places API key not configured');
    }

    // Use Google Places Details API
    const googleUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: 'address_components,formatted_address',
    });

    const response = await fetch(`${googleUrl}?${params}`);

    if (!response.ok) {
      return ApiError.internal('Failed to fetch place details');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places Details API error:', data.status, data.error_message);
      return ApiError.internal('Failed to fetch place details');
    }

    const result = data.result;
    const components = result.address_components || [];

    // Extract address components
    const getComponent = (types: string[]) => {
      const component = components.find((c: any) =>
        types.some((type) => c.types.includes(type))
      );
      return component?.long_name || '';
    };

    const getComponentShort = (types: string[]) => {
      const component = components.find((c: any) =>
        types.some((type) => c.types.includes(type))
      );
      return component?.short_name || '';
    };

    const streetNumber = getComponent(['street_number']);
    const route = getComponent(['route']);
    const city = getComponent(['locality', 'sublocality', 'neighborhood']);
    const state = getComponentShort(['administrative_area_level_1']);
    const postalCode = getComponent(['postal_code']);
    const country = getComponent(['country']);

    const addressComponents = {
      address: [streetNumber, route].filter(Boolean).join(' '),
      city,
      state,
      zipCode: postalCode,
      country: country === 'Canada' ? 'Canada' : country === 'United States' ? 'United States' : country,
      formattedAddress: result.formatted_address,
    };

    return apiSuccess({ components: addressComponents });
  } catch (error) {
    console.error('Place details error:', error);
    return ApiError.internal('Failed to fetch place details');
  }
}
