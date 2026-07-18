# Gemsutopia Changelog

## 2026-07-17 — Dead Link and Simulated Action Cleanup

### Completed
- Audited literal internal links against the complete Next.js page-route tree.
- Fixed the navigation link to the nonexistent `/social` route by pointing it to the existing Facebook page.
- Removed Google and Apple sign-in buttons that only displayed "coming soon" messages.
- Removed the nonfunctional invoice-download action from customer order history.
- Deleted the unused simulated auction bidding component; the rendered auction detail page already uses the real Quickdash-backed `BiddingModal`.
- Confirmed remaining customer-facing literal internal links resolve to existing routes.

### Files Changed
- `apps/web/src/components/layout/Dropdown.tsx`
- `apps/web/src/components/modals/AuthModal.tsx`
- `apps/web/src/components/user-dashboard/UserOrders.tsx`
- `apps/web/src/app/(auctions)/auctions/[id]/AuctionBidding.tsx` (deleted)
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- Searched storefront app/components for nonexistent `/social`, fake OAuth, simulated bidding, and invoice-download controls; no active matches remain.

### What's Next
- Close the functional-state branch after CI, then begin the separate visual-polish pass.
- Add a focused checkout test harness and address the existing dependency-security backlog as dedicated follow-up work rather than mixing either into visual polish.

## 2026-07-17 — Remove Unsupported Account Controls

### Completed
- Removed address edit and set-default controls that had no Quickdash endpoint and only displayed "coming soon" after interaction.
- Preserved working address creation and deletion, including the default flag available during creation.
- Removed fake Profile security controls and invented password-age text; real password change remains in Settings.
- Removed nonfunctional 2FA, login-history, and account-export controls.
- Clearly labeled notification/privacy/communication preferences as browser-local until Quickdash preference syncing exists.
- Updated preference-save confirmation so it no longer implies a server-backed account update.

### Files Changed
- `apps/web/src/components/user-dashboard/UserAddresses.tsx`
- `apps/web/src/components/user-dashboard/UserProfile.tsx`
- `apps/web/src/components/user-dashboard/UserSettings.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Quickdash contracts still needed: address update/default, server-backed customer preferences, 2FA, login history, and account export.
- Audit remaining storefront links/actions for dead or simulated behavior before closing the functional-state branch.

## 2026-07-17 — Tracking, Contact, Review, and Profile Failure States

### Completed
- Made checkout email visibly required for order tracking and prevented incomplete tracking submissions.
- Added tracking timeouts, no-store requests, safe invalid-response handling, and distinct not-found/service/connection error messages.
- Made contact submission results persistent and accessible instead of relying only on temporary toasts; failed submissions preserve the form for retry.
- Surfaced Quickdash review validation errors and differentiated service connectivity failures.
- Replaced silent profile-load failure with loading, error, and retry states.
- Removed deceptive address editing from Profile because that save contract only persists name and phone; address values are now read-only and direct customers to the Addresses section.

### Files Changed
- `apps/web/src/app/(public)/track/page.tsx`
- `apps/web/src/app/(info)/contact-us/page.tsx`
- `apps/web/src/components/modals/ReviewModal.tsx`
- `apps/web/src/components/user-dashboard/UserProfile.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Quickdash needs address update/default endpoints before those actions can be enabled honestly in Gemsutopia.
- Remove or disable remaining unsupported account controls such as 2FA, login history, account export, and any preference settings that are only stored locally but presented as server-backed.
- Add automated checkout coverage after the functional failure-state pass is complete.

## 2026-07-17 — Shipping Rate Loading and Retry State

### Completed
- Shipping rates are now calculated only after the customer submits a valid shipping address instead of firing background requests from partial address changes.
- Added a visible calculating state and disabled repeat submission while Quickdash resolves rates.
- Added a persistent inline shipping error with address guidance and an explicit retry action.
- Address changes clear stale shipping errors, and checkout cannot advance to payment methods without a valid current rate.
- Removed obsolete storefront listeners that could recalculate and overwrite shipping while the customer was already paying.

### Files Changed
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `apps/web/src/components/checkout/CustomerInfo.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- Confirmed the repository currently has no configured unit or end-to-end test runner; focused checkout automation requires introducing a test harness rather than extending existing coverage.

### What's Next
- Add a focused Playwright checkout harness for cancellation, missing return state, interrupted finalization, and inventory/price preflight failures.
- Continue functional state coverage for tracking, contact/review submission, and remaining silent account mutations.

## 2026-07-17 — PayPal Checkout Recovery States

### Completed
- Added a dedicated payment-finalization loading state when the customer returns from PayPal.
- Clear stale PayPal session data after a cancelled checkout while preserving Gem Pouch items.
- Classified checkout failures by recovery path: cart review for stock/price changes, payment retry for pre-payment failures, idempotent confirmation retry after PayPal return, and support escalation when redirect data is missing.
- Prevented the error-screen retry action from starting a second PayPal payment after capture; it now reloads the saved PayPal return flow and retries Quickdash order finalization.
- Made post-return messaging distinguish a captured payment from an interrupted confirmation attempt.
- Added contextual titles and action labels to the payment error state.

### Files Changed
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `apps/web/src/components/error-states/PaymentError.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Add explicit loading/retry state to shipping-rate calculation and prevent checkout progression while rates are being refreshed.
- Add focused automated coverage for cancelled, interrupted, duplicated, and recovered PayPal return flows.

## 2026-07-17 — Cart Inventory Reconciliation and Fresh CMS Updates

### Completed
- Replaced the broad first-page sold-out poll with direct Quickdash product checks for every item currently in the Gem Pouch.
- Made inventory reconciliation variant-aware, clamp cart quantities when available stock drops, remove confirmed sold-out items, and leave the cart untouched when Quickdash cannot be reached.
- Fixed live CMS refreshes overwriting fresh server-rendered content with stale CDN responses by disabling cache storage on editable site content, stats, and reviews endpoints.
- Forced homepage real-time refetches to bypass browser/CDN cache.
- Fixed `useCMSContent` to read the standardized API response envelope instead of replacing content with an undefined legacy field.

### Files Changed
- `apps/web/src/contexts/GemPouchContext.tsx`
- `apps/web/src/components/feedback/SoldOutItemsMonitor.tsx`
- `apps/web/src/app/api/site-content-public/route.ts`
- `apps/web/src/app/api/stats/route.ts`
- `apps/web/src/app/api/reviews/route.ts`
- `apps/web/src/app/HomeContent.tsx`
- `apps/web/src/hooks/useCMSContent.ts`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Add explicit checkout preflight/recovery states around inventory validation, shipping calculation, PayPal cancellation, and post-payment order recovery.
- Continue replacing silent fallbacks with retryable functional states before visual polish.

## 2026-07-17 — Functional Loading and Failure States

### Completed
- Added a shared commerce error classifier for offline, authorization, rate-limit, timeout, and Quickdash outage failures.
- Added a reusable retryable load-error state without starting the visual redesign.
- Fixed shop, category, featured, new-arrival, rare-find, and auction pages so API failures no longer masquerade as empty inventory.
- Added retry behavior to all of those catalog surfaces and PayPal method discovery.
- Made the gem loader fact stable and added accessible live status semantics.
- Replaced silent account address/referral failures with recoverable error states.
- Standardized customer order and bid error messages.
- Updated customer order detail mapping to consume real Quickdash payment, currency, address, item, discount, and tracking data instead of invented placeholders.

### Files Changed
- `apps/web/src/components/ui/page-loader.tsx`
- `apps/web/src/components/empty-states/index.tsx`
- `apps/web/src/lib/commerce-error.ts`
- `apps/web/src/lib/storefront-client.ts`
- `apps/web/src/app/(shop)/shop/page.tsx`
- `apps/web/src/app/(shop)/shop/[category]/page.tsx`
- `apps/web/src/app/(shop)/shop/featured/page.tsx`
- `apps/web/src/app/(shop)/shop/new-arrivals/page.tsx`
- `apps/web/src/app/(shop)/shop/rare-finds/page.tsx`
- `apps/web/src/app/(auctions)/auctions/page.tsx`
- `apps/web/src/app/(user)/orders/[id]/page.tsx`
- `apps/web/src/components/user-dashboard/UserOrders.tsx`
- `apps/web/src/components/user-dashboard/UserBids.tsx`
- `apps/web/src/components/user-dashboard/UserAddresses.tsx`
- `apps/web/src/components/user-dashboard/UserReferrals.tsx`
- `apps/web/src/components/checkout/PaymentMethods.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Deploy the paired Quickdash customer-order ownership changes.
- Implement and verify the complete Gemsutopia customer-account lifecycle in Quickdash, including storefront membership at signup so Reese can see registered customers before they order.
- Diagnose and productionize Resend transactional delivery. Order confirmation must work for guest checkout; account verification/reset and shipping/tracking messages follow on the same delivery foundation.
- Test signed-in and guest PayPal checkout recovery, followed by My Orders and order-detail reads.
- Continue functional handling for inventory reservation/decrement and idempotent paid-order finalization before visual polish.

## 2026-07-17 — Ecommerce Frontend Readiness Audit

### Completed
- Audited the current storefront routes, customer journeys, `StorefrontClient` capabilities, checkout flow, account dashboard, cart/wishlist persistence, product inventory handling, and auction implementation.
- Separated missing storefront work from Quickengine/Quickdash backend contract requirements.
- Identified launch blockers: browser-driven post-payment order creation, non-atomic inventory handling, zero tax calculation, incomplete shipping selection/configuration, incomplete order detail data, missing account recovery/address operations, simulated auction bidding, and no automated checkout tests.
- Produced a prioritized roadmap covering commerce correctness, catalog/cart completeness, post-purchase service, account lifecycle, operational resilience, accessibility/SEO, analytics/consent, and optional auction functionality.

### Files Changed
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### What's Next
- Define and implement one server-authoritative Quickengine checkout contract that prices the cart, validates inventory, calculates tax/shipping/discounts, creates or reserves the order, and finalizes it idempotently from verified payment webhooks.
- Wire Gemsutopia to that checkout contract, then add end-to-end tests for successful, declined, cancelled, duplicated, expired-stock, and post-payment-recovery paths.

## 2026-07-03 — Preserve Variant Data for Inventory-Aware Orders

### Completed
- Investigated why a successful paid checkout did not deplete item quantity or remove the item from the shop.
- Confirmed Quickdash's storefront order creation endpoint currently creates orders, order items, and payment records, but does not decrement variant inventory.
- Confirmed Quickdash inventory is variant-based, while Gemsutopia cart/order payloads were only preserving product IDs.
- Updated Gemsutopia product detail pages to use the primary Quickdash variant ID, SKU, variant price, and returned stock quantity when available.
- Updated Gem Pouch items and checkout order creation to preserve and send `variantId`/`sku` to Quickdash.

### Files Changed
- `apps/web/src/lib/storefront-client.ts`
- `apps/web/src/contexts/GemPouchContext.tsx`
- `apps/web/src/app/(shop)/product/[id]/page.tsx`
- `apps/web/src/app/(shop)/product/[id]/ProductContent.tsx`
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

### What's Next
- Quickdash must decrement `inventory.quantity` and write `inventoryLogs` inside the storefront order creation path after a paid order is recorded.
- Quickdash should expose inventory/default variant data on product list responses so Gemsutopia shop grids can stop using stock display fallbacks.

## 2026-07-03 — Preserve Post-Payment Checkout Errors

### Completed
- Investigated the path where PayPal payment succeeds but Gemsutopia shows the payment error screen after redirect.
- Updated checkout return handling to show durable, specific post-payment errors instead of relying on a fast toast.
- Added PayPal order/capture identifiers to the Quickdash order creation payload metadata/payment record.
- Treated PayPal as paid when a capture ID is present, even if the returned status string is unexpected.
- Stored the last checkout error in `localStorage.lastCheckoutError` for debugging after a failed return.

### Files Changed
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `apps/web/src/components/error-states/PaymentError.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

## 2026-07-03 — Use Real Quickdash Shipping Rates in Checkout

### Completed
- Confirmed Quickdash production currently returns legacy simple shipping values under `/api/storefront/site`, while the real `/api/storefront/shipping/rates` endpoint returns no configured rates for CA or US.
- Updated checkout shipping calculation to use `store.shipping.getRates()` instead of the legacy simple `site.shipping` fields exposed through `/api/shipping-settings`.
- Checkout now charges the cheapest real Quickdash shipping rate when configured, and charges `0` when no real rates are available.
- Removed the legacy combined/simple shipping path from checkout so hidden stale settings cannot produce automatic CAD 21 / USD 14-style charges.

### Files Changed
- `apps/web/src/components/checkout/CheckoutFlow.tsx`
- `.Codex/changelog.md`
- `memory/MEMORY.md`

### Verification
- `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.
- Direct Quickdash checks confirmed `/shipping/rates` returns no CA/US rates, so checkout will calculate shipping as `0` until rates are configured.

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
