import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_STOREFRONT_API_KEY;
  const storefrontUrl = (process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://app.quickdash.net').replace(/\/$/, '');
  if (!apiKey) {
    return Response.json({ error: 'Storefront is not configured' }, { status: 503 });
  }

  const response = await fetch(`${storefrontUrl}/api/storefront/pusher/auth`, {
    method: 'POST',
    headers: { 'X-Storefront-Key': apiKey },
    body: await request.formData(),
    cache: 'no-store',
  });

  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}
