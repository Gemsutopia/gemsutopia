import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

const DEFAULTS = {
  enableShipping: true,
  internationalShipping: true,
  singleItemShippingCAD: 21.0,
  singleItemShippingUSD: 15.0,
  combinedShippingCAD: 25.0,
  combinedShippingUSD: 18.0,
  combinedShippingEnabled: true,
  combinedShippingThreshold: 2,
};

/**
 * Public endpoint to get shipping settings for checkout calculations.
 * Reads from Quickdash site settings API — no direct DB access.
 */
export async function GET() {
  try {
    const { site } = await store.site.getSettings() as any;
    const s = site.shipping;

    if (!s) {
      return Response.json({ settings: DEFAULTS, isDefault: true });
    }

    const shippingSettings = {
      enableShipping: s.enabled !== false,
      internationalShipping: s.international !== false,
      singleItemShippingCAD: s.singleItemCAD || DEFAULTS.singleItemShippingCAD,
      singleItemShippingUSD: s.singleItemUSD || DEFAULTS.singleItemShippingUSD,
      combinedShippingCAD: s.combinedCAD || DEFAULTS.combinedShippingCAD,
      combinedShippingUSD: s.combinedUSD || DEFAULTS.combinedShippingUSD,
      combinedShippingEnabled: s.combinedEnabled !== false,
      combinedShippingThreshold: s.combinedThreshold || DEFAULTS.combinedShippingThreshold,
    };

    return Response.json({ settings: shippingSettings });
  } catch {
    return Response.json({ settings: DEFAULTS, isDefault: true });
  }
}
