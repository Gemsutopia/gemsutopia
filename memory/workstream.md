# Active Workstream Details

## Payment System - Sandbox/Live Separation
**Status:** In progress (uncommitted in quickdash)

### What's done:
- Test key fields added to all provider config types (Stripe, PayPal, Polar, Square)
- Payment settings UI shows contextual fields based on testMode toggle
- `workspace-integrations.ts` updated: `getStripeSecretKey()`, `getPayPalCredentials()`, `getPolarCredentials()` all respect testMode
- Stripe, PayPal, Polar, Square all have test/live credential UI

### What's still needed:
1. **Webhook endpoints** - Each payment provider needs a webhook route in Quickdash
   - Users need to see their webhook URL in the payment settings page so they can paste it into Stripe/PayPal/Polar dashboards
   - Stripe: `/api/webhooks/stripe/[workspaceId]` or similar
   - PayPal: `/api/webhooks/paypal/[workspaceId]`
   - Polar: `/api/webhooks/polar/[workspaceId]`
2. **Webhook URL display** - Show the endpoint URL in each provider's settings card
3. **settings/actions.ts** - Server actions for saving/loading test keys (partially done)

## Maintenance / Sandbox Overlay
**Status:** Not started

### Requirements:
- **Maintenance mode**: Shuts down the storefront entirely, shows maintenance page
- **Sandbox mode**: Allows users to test payments with sandbox keys
  - Visual indicator on storefront that it's in sandbox mode
  - Payments in sandbox vs live are contextually separated
  - Users can view sandbox payments vs live payments separately in admin
  - Never mix sandbox and live transaction data

## Gemsutopia Checkout Rewrite
**Status:** In progress (uncommitted)

### What's done:
- `CheckoutFlow.tsx` rewritten to call `store.orders.create()` instead of local `/api/orders`
- `storefront-client.ts` has `orders.create()` method added
- CSP updated for `api.frankfurter.app`

### What's still needed:
- Test the full checkout flow end-to-end
- Ensure the quickdash `/api/storefront/orders` POST endpoint handles all the data correctly
