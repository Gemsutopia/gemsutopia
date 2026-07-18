import { StorefrontError } from './storefront-client';

export function getCommerceErrorMessage(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your connection and try again.';
  }

  if (error instanceof StorefrontError) {
    if (error.status === 401 || error.status === 403) {
      return 'The store connection is not authorized. Please try again shortly.';
    }
    if (error.status === 404) {
      return 'The requested information could not be found.';
    }
    if (error.status === 429) {
      return 'The store is receiving too many requests. Wait a moment and try again.';
    }
    if (error.status >= 500) {
      return 'The store service is temporarily unavailable. Your cart and saved items are safe.';
    }
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'The store took too long to respond. Please try again.';
  }

  return 'We could not reach the store service. Please try again.';
}
