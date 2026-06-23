# Gemsutopia Project Memory

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
