# Gemsutopia - Claude Code Project Instructions

## Project Overview
Gemsutopia is an ecommerce storefront running on the Quickdash platform. It's the first proof-of-concept store.
- **Admin panel (Quickdash):** `/Users/ash/Desktop/quickdash`
- **This storefront:** `/Users/ash/Desktop/gemsutopia`
- **Plans:** `/Users/ash/Desktop/quickdash/plan.md` and `plan2.md`

## Architecture
- Next.js app in `apps/web/`
- Talks to Quickdash via `StorefrontClient` class at `apps/web/src/lib/storefront-client.ts`
- Quickdash API base: `https://app.quickdash.net` (or localhost:3001 in dev)
- Auth: `X-Storefront-Key` header on all API calls

## Rules
- **NEVER commit or push to git.** Only provide commit messages in chat. The user runs all git commands manually.
- **ALWAYS update `.claude/changelog.md` when completing work** — log what was done, what files changed, and what's next.
- **ALWAYS update memory files** at session end or before any risky operation.
- **Read `.claude/changelog.md` at the start of every session** to understand where the last session left off.
- Two Claude instances work in parallel: one here, one in quickdash. The user relays context between them.

## Key Files
- `apps/web/src/lib/storefront-client.ts` — SDK for Quickdash API
- `apps/web/src/components/checkout/CheckoutFlow.tsx` — Checkout flow
- `apps/web/next.config.ts` — CSP headers, rewrites
- `apps/web/src/app/` — All pages
