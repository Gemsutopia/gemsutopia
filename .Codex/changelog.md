# Gemsutopia Changelog

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
