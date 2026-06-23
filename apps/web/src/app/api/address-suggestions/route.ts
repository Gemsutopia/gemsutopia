import { NextRequest } from 'next/server';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const country = searchParams.get('country') || 'Canada';

    if (!query || query.length < 3) {
      return apiSuccess({ suggestions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      // Fallback to OpenStreetMap if no Google API key
      return fetchFromOpenStreetMap(query, country);
    }

    // Use Google Places Autocomplete API
    const googleUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = new URLSearchParams({
      input: query,
      key: apiKey,
      types: 'address',
      components: country === 'Canada' ? 'country:ca' : 'country:us',
    });

    const response = await fetch(`${googleUrl}?${params}`);

    if (!response.ok) {
      return fetchFromOpenStreetMap(query, country);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return fetchFromOpenStreetMap(query, country);
    }

    const suggestions = (data.predictions || []).map((prediction: any) => ({
      description: prediction.description,
      placeId: prediction.place_id,
      mainText: prediction.structured_formatting?.main_text || '',
      secondaryText: prediction.structured_formatting?.secondary_text || '',
    }));

    return apiSuccess({ suggestions, source: 'google' });
  } catch (error) {
    console.error('Address suggestions error:', error);
    return apiSuccess({ suggestions: [] });
  }
}

// Fallback to OpenStreetMap Nominatim API
async function fetchFromOpenStreetMap(query: string, country: string) {
  try {
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      addressdetails: '1',
      countrycodes: country === 'Canada' ? 'ca' : 'us',
    });

    const response = await fetch(`${nominatimUrl}?${params}`, {
      headers: {
        'User-Agent': 'Gemsutopia/1.0 (gemsutopia@gmail.com)',
      },
    });

    if (!response.ok) {
      return apiSuccess({ suggestions: [] });
    }

    const results = await response.json();
    const suggestions = results.map((result: any) => ({
      description: result.display_name,
      placeId: null,
      mainText: result.address?.road || result.display_name.split(',')[0],
      secondaryText: [result.address?.city, result.address?.state].filter(Boolean).join(', '),
    }));

    return apiSuccess({ suggestions, source: 'osm' });
  } catch {
    return apiSuccess({ suggestions: [] });
  }
}
