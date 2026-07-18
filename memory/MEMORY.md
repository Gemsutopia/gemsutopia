# Gemsutopia Project Memory

## Unsupported Account Controls Removed (2026-07-17)
- Removed address edit/default, 2FA, login history, account export, and fake Profile security controls because Quickdash has no backing contracts for them.
- Address add/delete and password change/account deletion remain available because they have real requests.
- Customer preferences remain browser-local and are now labeled honestly rather than presented as synced Quickdash settings.

## Tracking and Account Failure-State Pass (2026-07-17)
- Order tracking now requires both order number and checkout email and distinguishes not-found, timeout, service, and connection failures.
- Contact and review failures remain visible with retryable form data; review validation messages from Quickdash are preserved.
- Profile loading no longer silently renders an empty account on failure.
- Profile address fields are read-only because the current profile update request only persists name and phone. Real address editing/default selection remains blocked on Quickdash endpoints.

## Shipping Rate State (2026-07-17)
- Shipping-rate lookup now runs on valid address submission rather than incomplete background address changes.
- Checkout shows a persistent inline error and retry action, disables duplicate submissions while calculating, and cannot advance without a current rate.
- The repository has no configured test runner. Checkout automation will require a new focused harness.

## PayPal Checkout Recovery States (2026-07-17)
- PayPal return processing now has an explicit full-page confirmation loader.
- Cancelled PayPal attempts clear stale redirect session data but preserve the Gem Pouch.
- Checkout errors are recovery-aware: inventory/price changes return to cart, ordinary pre-payment failures retry payment, and captured/interrupted returns retry the saved idempotent finalization instead of initiating a duplicate payment.
- Missing PayPal redirect state escalates to support because the browser no longer has enough information to safely reconstruct the order.

## Cart Inventory and CMS Freshness (2026-07-17)
- Gem Pouch inventory monitoring now fetches each cart product directly from Quickdash, respects variant stock, clamps reduced quantities, removes confirmed sold-out items, and preserves the cart on API failures.
- The fresh-then-old content flash was caused by real-time client refetches consuming CDN-cached editable-content responses after the server had rendered fresh Quickdash data.
- Editable site content, stats, and reviews API responses are now `no-store`; homepage event refetches also bypass cache.
- `useCMSContent` now reads `data.data.content`, matching the standardized API response envelope.

## Project Architecture
- **Quickdash** (`/Users/ash/Desktop/quickdash`) = Headless BaaS admin panel
- **Gemsutopia** (`/Users/ash/Desktop/gemsutopia`) = First storefront / proof-of-concept running on Quickdash
- Plans live at `/Users/ash/Desktop/quickdash/plan.md` and `plan2.md`
- Gemsutopia uses `StorefrontClient` class (`apps/web/src/lib/storefront-client.ts`)
- Store singleton at `apps/web/src/lib/store.ts`

## Quickdash Vision (FULL PICTURE)
See [vision.md](./vision.md) for the complete product roadmap.
Quickdash is a **headless Backend-as-a-Service** — not just ecommerce.
- Framework-agnostic: connects to Next.js, Svelte, Angular, vanilla, Shopify, WordPress, Wix, etc.
- Full content management: NO hardcoded pages. Users define their own content structure.
- Template marketplace: pre-built frontends pre-wired to Quickdash API
- Gemsutopia = proof of concept (real business, 5 years established, owner is user's best friend)
- End goal: sell as a service once features/workflow/tiers are solid

## Current Work Stream (as of 2026-02-10)
See [workstream.md](./workstream.md) for detailed state.

## Deployment Recovery (2026-06-22)
- A prior unrelated-history merge was committed with literal conflict markers still present in nine files.
- The markers were removed locally, including the invalid `apps/web/package.json` that blocked Vercel parsing and malformed `turbo.json`.
- No Git commit or push was made by Codex; the user must commit and push the repair before redeploying.

## Quickdash Storefront Publishing Fixes (2026-06-27)
- Product detail pages now use media returned by Quickdash instead of hardcoded placeholder gem images.
- `apps/web/src/app/(shop)/product/[id]/page.tsx` builds a de-duplicated product image list with the Quickdash thumbnail first.
- `apps/web/src/app/(shop)/product/[id]/ProductContent.tsx` falls back to placeholder media only when Quickdash returns no product images.
- Local TypeScript verification passed; lint still needs script cleanup because `next lint --ignore-during-builds` is unsupported by the current Next version.

## Live Payment Checkout Safety Pass (2026-07-02)
- Before live Stripe/PayPal testing, checkout totals were normalized so the selected currency is used consistently for provider checkout payloads, redirect recovery data, Quickdash order creation totals, and the success receipt.
- `PaymentForm` now receives explicit currency/converted totals from `CheckoutFlow` instead of reading currency independently from browser storage.
- Shipping currency is tracked separately from display currency so Canada/USA shipping rates convert correctly before payment.
- PayPal and Square client payload types now allow optional shipping/discount fields for backend support.
- Checkout Terms link now points to `/terms`.
- Verification: `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed. Lint remains blocked by the stale `next lint --ignore-during-builds` script, and production build was stopped after hanging silently.

## PayPal Method Visibility Fallback (2026-07-03)
- Production Quickdash currently returns no methods from `/api/storefront/payments/methods`, but returns live PayPal from `/api/storefront/site` under `site.payments.methods`.
- Gemsutopia now falls back to `site.payments` inside `StorefrontClient.payments.getMethods()` when the dedicated methods endpoint is empty.
- PayPal checkout payload now sends `unitAmount` per item, matching Quickdash's PayPal endpoint contract.
- Verification: TypeScript passed, and direct production API check showed fallback providers include `{ provider: "paypal", mode: "live" }`.
- Quickdash still needs a backend fix so `/payments/methods` and `/site` return consistent payment method data.

## Shipping Rate Fallback Cleanup (2026-07-03)
- The storefront had hard-coded shipping fallback rates in both `/api/shipping-settings` and `lib/utils/shipping.ts`: CAD 21 single, USD 15 single, CAD 25 combined, USD 18 combined.
- These were changed to zero/no-shipping fallbacks so stale frontend defaults cannot create unexpected shipping charges.
- `/api/shipping-settings` now uses nullish coalescing (`??`) instead of `||`, so Quickdash values of `0` are preserved instead of replaced.
- Verification: TypeScript passed and a search confirmed the old shipping constants no longer exist as shipping rates.

## Checkout Shipping Rates Correction (2026-07-03)
- Quickdash production still exposes legacy simple shipping values under `/api/storefront/site`, currently including CAD 20, USD 16.50, CAD 25 combined, and USD 18 combined.
- The real Quickdash `/api/storefront/shipping/rates` endpoint returns no configured rates for CA or US.
- Checkout now uses `store.shipping.getRates()` instead of `/api/shipping-settings` / legacy `site.shipping` values.
- If real Quickdash shipping rates are configured, checkout uses the cheapest returned rate. If no rates are configured, checkout charges `0` shipping.
- Verification: TypeScript passed and direct Quickdash checks confirmed no real CA/US shipping rates are configured.

## Post-Payment Checkout Error Visibility (2026-07-03)
- A live PayPal payment succeeded but Gemsutopia showed the payment error screen after redirect, meaning the failure happened after provider approval/capture in the order-recording path.
- Checkout now preserves detailed post-payment errors on the visible error screen and writes them to `localStorage.lastCheckoutError`.
- PayPal capture/order IDs are included in the Quickdash order creation payload so support/admin can reconcile paid orders more easily.
- PayPal capture handling now accepts a capture ID as evidence of payment even if the returned status string is unexpected.
- Verification: TypeScript passed.

## Inventory Depletion Follow-Up (2026-07-03)
- Successful provider payment does not currently guarantee inventory depletion because Quickdash's storefront order POST route creates order/payment rows but does not update `inventory.quantity` or `inventoryLogs`.
- Quickdash inventory is variant-based, so the storefront must send `variantId`; Gemsutopia now preserves `variantId`/`sku` in Gem Pouch items and checkout order payloads when product detail data provides them.
- Product detail pages now read primary variant price/SKU and returned stock quantity from Quickdash detail responses.
- Product/shop grid list pages still need Quickdash product list responses to expose default variant + stock data; otherwise those views have to fall back or fetch each product detail individually.
- Verification: `pnpm --filter @gemsutopia/web exec tsc --noEmit` passed.

## Ecommerce Frontend Readiness Audit (2026-07-17)
- Gemsutopia has most visible storefront surfaces, but it is not yet production-complete as an ecommerce application.
- Highest-risk architecture issue: payment approval/capture is followed by order creation in the browser. Quickengine should own a server-authoritative, idempotent checkout/order/payment state machine finalized from verified provider webhooks.
- Checkout currently sends tax as `0`; inventory is not atomically reserved/decremented; shipping automatically chooses the cheapest returned rate and falls back to free when none exist.
- Quickdash product list responses still need variant/stock data. Order list/detail contracts need currency and line items for a complete customer account experience.
- Missing or incomplete user-facing functions include password reset/email verification, address edit/default, invoice/receipt download, cancellation/return/refund requests, and simulated auction bidding.
- There is no meaningful automated test suite for catalog/cart/checkout/payment/order flows, and the current lint script is invalid for the installed Next.js version.
- Recommended delivery order: server checkout contract and payment reconciliation; inventory/tax/shipping correctness; post-purchase/account features; automated E2E/contract tests; accessibility/performance/analytics hardening; auctions only if required for launch.

## User Preferences & Rules
- **NEVER commit or push** — user handles all git operations manually
- Provide commit messages in chat when sections are done (no Co-Authored-By)
- Two Claude instances work simultaneously (one quickdash, one gemsutopia)
- User relays context between instances
- ALWAYS update `.claude/changelog.md` when completing work
- ALWAYS read `.claude/changelog.md` at session start
- User gets frustrated when context is lost — save progress aggressively
- User hates hardcoded content pages (FAQ, Testimonials, Stats as separate pages)
- User hates ugly routes like `/collections/faq` and `/pages/slug`
- Testimonials and Reviews are redundant — should be unified

## Key Files
- `apps/web/src/lib/storefront-client.ts` — SDK for Quickdash API
- `apps/web/src/components/checkout/CheckoutFlow.tsx` — Checkout flow
- `apps/web/src/components/checkout/PaymentMethods.tsx` — Payment provider selection
- `apps/web/src/components/checkout/PaymentForm.tsx` — Provider-specific payment forms
- `apps/web/src/lib/contexts/ModeContext.tsx` — Site mode (live/maintenance/sandbox)
- `apps/web/src/components/layout/MaintenanceOverlay.tsx` — Maintenance overlay
- `apps/web/next.config.ts` — CSP headers, rewrites
# 2026-07-17 functional state and customer-order contract

- Catalog and auction API failures now render retryable load errors instead of false empty states.
- Account address/referral/order/bid failures are no longer silently swallowed.
- Gemsutopia order details now expect Quickdash to return payment, currency, items, addresses, discounts, and tracking.
- Quickdash must deploy the paired order JWT ownership changes before signed-in order history can be validated.
- Visual polish remains intentionally deferred until commerce behavior is complete.
- Authentication/customer management is a launch workstream: registration and login exist, but Quickdash currently has no storefront/workspace customer-membership record and only shows users as customers after an order.
- Required auth work: workspace-scoped customer membership, signup collection in Quickdash, membership-aware login, email verification, password reset, session expiry/revocation, complete profile/address CRUD, and verified linkage of wishlist/orders/referrals to the customer.
- Reese has already completed a successful live PayPal purchase as a guest and received the funds. Basic live payment processing is proven; remaining checkout work is integrity, idempotency, inventory, recovery, and order visibility.
- Transactional email is currently not arriving despite Resend integration code. Treat email delivery as a separate launch-critical workstream for guests and account holders: production credentials/domain/from-address, delivery logging, retry behavior, order confirmation, shipping/tracking, password reset, and email verification.
