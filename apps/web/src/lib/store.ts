/**
 * Store instance for gemsutopia
 *
 * This connects to the Quickdash backend.
 * Replace the apiKey with your actual storefront API key from:
 * Quickdash Admin > Settings > Storefronts
 */

import { StorefrontClient } from './storefront-client'

// Create the store instance
export const store = new StorefrontClient({
	apiKey: process.env.NEXT_PUBLIC_STOREFRONT_API_KEY || 'sf_your_api_key_here',
	baseUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://app.quickdash.net',
})

// Re-export types for convenience
export type {
	Product,
	Category,
	Auction,
	Order,
	Customer,
	Address,
	SiteSettings,
	ShippingRate,
	WishlistItem,
	Review,
	Discount,
	FaqItem,
	StatItem,
	Testimonial,
	SiteContentItem,
} from './storefront-client'

// ============================================
// Usage Examples (delete this section later)
// ============================================

/*
// Fetch products
const { products, pagination } = await store.products.list({
  category: 'gemstones',
  limit: 20,
  sort: 'price',
  order: 'asc'
})

// Get single product
const { product } = await store.products.get('blue-sapphire')

// Customer auth
const { user, token } = await store.auth.login({
  email: 'customer@example.com',
  password: 'password123'
})
// Token is automatically stored, or save it to localStorage:
localStorage.setItem('customerToken', token)

// On page load, restore token:
const savedToken = localStorage.getItem('customerToken')
if (savedToken) store.setCustomerToken(savedToken)

// Get customer profile
const { user: profile } = await store.auth.getProfile()

// Wishlist (requires auth)
await store.wishlist.add('product-uuid')
const { wishlist } = await store.wishlist.list()

// Checkout with Stripe
const { url } = await store.payments.createStripeSession({
  items: [
    { name: 'Blue Sapphire', price: 299.99, quantity: 1 }
  ],
  successUrl: `${window.location.origin}/checkout/success`,
  cancelUrl: `${window.location.origin}/cart`,
})
// Redirect to Stripe
window.location.href = url

// Validate discount
const { discount } = await store.discounts.validate('SAVE10', 199.99)
console.log(`You save $${discount.discountAmount}`)

// Get shipping rates
const { rates } = await store.shipping.getRates({
  country: 'US',
  state: 'CA',
  subtotal: 299.99
})
*/
