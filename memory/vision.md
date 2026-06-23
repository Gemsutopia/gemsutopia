# Quickdash Product Vision

## What Quickdash IS
A headless Backend-as-a-Service (BaaS) that provides:
- Full content management (user-defined, no hardcoded sections)
- E-commerce (products, orders, payments, discounts, shipping)
- Auth (OAuth + email via Better Auth)
- Media management (workspace-scoped, tiered storage)
- Email (BYOK Resend integration)
- Analytics, reviews, notifications
- Multi-provider payments (Stripe, PayPal, Polar, Square, Shopify, Reown/crypto)

## What Quickdash is NOT
- Not a website builder (headless only)
- Not limited to ecommerce — any site can use it
- Not competing with Shopify/Wix directly — it's the backend that can CONNECT to them

## Target Architecture
```
User's Frontend (any framework/platform)
    ↕ StorefrontClient SDK / REST API
Quickdash Admin Panel (app.quickdash.net)
    ↕ Database (Neon PostgreSQL)
```

## Revenue Model
- Tiered subscriptions (hobby free / lite / essentials / pro)
- Template marketplace (one-time purchases)
- Promo: buy a template → 1 free month of Lite tier

## Priority Roadmap
1. Sandbox/maintenance mode (in progress)
2. Gemsutopia checkout (in progress)
3. Webhook endpoints for payment providers (in progress)
4. Marketing site + auth (quickdash.net — signup, OAuth, email auth)
5. Template marketplace (framework-agnostic, one per framework)
6. CMS overhaul — kill hardcoded pages, dynamic content zones
7. Routing system — user-controlled URL structure
8. External platform connectors (Shopify, WordPress, Wix, Squarespace)

## Content Management Vision
- Users define their own content collections/zones
- No hardcoded FAQ, Testimonials, Stats pages
- Testimonials should merge with Reviews (redundant)
- Content is structured by the user: they define fields, types, relationships
- Routing should be configurable — no `/collections/slug` or `/pages/slug` forced patterns
- Goal: edit ALL media and content on ALL pages of the connected site
- Research needed: how to discover/map content from an existing site

## Gemsutopia's Role
- First proof-of-concept storefront
- Real business (5 years, owner = user's best friend)
- Must be fully manageable from Quickdash admin
- All content comes from API, nothing hardcoded
- Validates the entire platform before selling as a service
