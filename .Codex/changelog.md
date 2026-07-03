# Gemsutopia Changelog

## 2026-07-03 — Remove Hard-Coded Shipping Rate Fallbacks

### Completed
- Confirmed the storefront had hard-coded shipping fallback rates in `apps/web/src/app/api/shipping-settings/route.ts` and `apps/web/src/lib/utils/shipping.ts`.
- Removed the old baked-in rates: CAD 21 single, USD 15 single, CAD 25 combined, USD 18 combined.
- Changed fallback behavior to no shipping charge when Quickdash shipping settings are missing or unavailable, instead of silently charging stale hard-coded rates.
- Changed shipping setting mapping from `||` to `??` so intentional Quickdash `0` values are honored.

### Files Changed
- `apps/web/src/app/api/shipping-settings/route.ts`
- `apps/web/src/lib/utils/shipping.ts`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- Searched for the old shipping constants and confirmed no hard-coded shipping rates remain.

## 2026-07-03 — PayPal Method Visibility Fallback

### Completed
- Diagnosed live Quickdash payment method responses for the Gemsutopia storefront key.
- Confirmed `/api/storefront/payments/methods` currently returns `methods: []` while `/api/storefront/site` returns live PayPal in `site.payments.methods`.
- Updated `StorefrontClient.payments.getMethods()` to fall back to `site.payments` when the dedicated payment methods endpoint returns no methods.
- Fixed PayPal checkout item payload from `amount` to `unitAmount` to match Quickdash's PayPal checkout endpoint.

### Files Changed
- `apps/web/src/lib/storefront-client.ts`
- `apps/web/src/components/checkout/PaymentForm.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- Direct production API check confirmed fallback sees `paypal` with `mode: live`.

### What's Next
- Push/deploy Gemsutopia and verify PayPal appears as the only checkout option while Stripe is disabled.
- Quickdash should still fix the inconsistency between `/payments/methods` and `/site`.

## 2026-07-02 — Live Payment Checkout Safety Pass

### Completed
- Reviewed the storefront checkout flow before live Stripe/PayPal testing.
- Fixed checkout currency normalization so displayed payment totals, provider checkout line items, saved redirect data, and Quickdash order totals use the selected checkout currency consistently.
- Preserved converted items, subtotal, shipping, and discounts through provider redirects so the success receipt matches the payment that was taken.
- Added optional shipping/discount request fields to PayPal and Square checkout client payloads for backend support.
- Fixed the checkout terms agreement link from `/terms-of-service` to the actual `/terms` route.
- Confirmed local payment keys are not needed in the repo because provider credentials are expected in Vercel/Quickdash deployment settings.

### Files Changed
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `apps/web/src/components/checkout/PaymentForm.tsx`
- `apps/web/src/components/checkout/PaymentMethods.tsx`
- `apps/web/src/lib/storefront-client.ts`
- `.claude/changelog.md`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- `pnpm --filter @gemsutopia/web lint` is still blocked by the existing unsupported `next lint --ignore-during-builds` script.
- `pnpm --filter @gemsutopia/web build` was stopped after hanging silently during production build compilation.

### What's Next
- Run one low-value live Stripe transaction after deploying this patch and confirm the Stripe amount, Quickdash order total, customer receipt, and inventory update all match.
- After Stripe passes, test PayPal with the same subtotal/shipping/discount combinations.
- Update the lint script to remove or replace the stale `--ignore-during-builds` flag.
