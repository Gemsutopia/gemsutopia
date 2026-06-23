'use client';
import { useEffect, useRef } from 'react';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

export default function SoldOutItemsMonitor() {
  const { items: cartItems, removeSoldOutItems: removeCartSoldOut } = useGemPouch();
  const { items: wishlistItems } = useWishlist(); // Note: We DON'T remove sold out items from wishlist
  const lastCheckRef = useRef<number>(0);
  const notifiedItemsRef = useRef<Set<string>>(new Set()); // Track which items we've already notified about

  useEffect(() => {
    const checkSoldOutItems = async () => {
      // Don't check too frequently (every 30 seconds max)
      const now = Date.now();
      if (now - lastCheckRef.current < 30000) {
        return;
      }
      lastCheckRef.current = now;

      try {
        // Get all unique item IDs from cart and wishlist
        const allItemIds = [
          ...new Set([...cartItems.map(item => item.id), ...wishlistItems.map(item => item.id)]),
        ];

        if (allItemIds.length === 0) {
          return; // No items to check
        }

        // Fetch current product data
        const response = await fetch('/api/products');
        if (!response.ok) {
          return;
        }

        let data;
        try {
          const responseText = await response.text();
          data = JSON.parse(responseText);
        } catch {
          return; // Skip this check if we can't parse the response
        }

        const { products } = data;
        if (!products) {
          return;
        }

        // Create a map of product ID to inventory
        const inventoryMap = new Map(
          products.map((product: any) => [product.id, product.inventory || 0])
        );

        // Check for sold out items in cart that we haven't notified about yet
        const soldOutCartItems = cartItems.filter(item => {
          const currentInventory = inventoryMap.get(item.id);
          return (
            currentInventory !== undefined &&
            currentInventory === 0 &&
            !notifiedItemsRef.current.has(item.id)
          ); // Only include items we haven't notified about
        });

        // Note: We don't remove sold out items from wishlist - they stay with SOLD overlay

        // Remove sold out items from cart and notify ONLY if there are new sold out items
        if (soldOutCartItems.length > 0) {
          // Mark these items as notified
          soldOutCartItems.forEach(item => {
            notifiedItemsRef.current.add(item.id);
          });

          // Remove items IMMEDIATELY by passing their IDs
          const soldOutItemIds = soldOutCartItems.map(item => item.id);
          removeCartSoldOut(soldOutItemIds);

          toast.info(
            `Removed ${soldOutCartItems.length} sold out item${soldOutCartItems.length > 1 ? 's' : ''} from your cart`
          );
        }

        // Clean up notified items that are no longer in cart or have been restocked
        const currentCartIds = new Set(cartItems.map(item => item.id));
        const recentlyNotified = Array.from(notifiedItemsRef.current);

        for (const itemId of recentlyNotified) {
          // Remove from notified set if item is no longer in cart
          if (!currentCartIds.has(itemId)) {
            notifiedItemsRef.current.delete(itemId);
            continue;
          }

          // Remove from notified set if item is back in stock
          const currentInventory = inventoryMap.get(itemId);
          if (typeof currentInventory === 'number' && currentInventory > 0) {
            notifiedItemsRef.current.delete(itemId);
          }
        }

        // Note: We DON'T remove sold out items from wishlist - they stay with SOLD overlay
        // This allows users to keep them and purchase later if restocked
      } catch {
        // Silently fail - don't spam the user with error notifications
      }
    };

    // Check immediately if we have items
    if (cartItems.length > 0 || wishlistItems.length > 0) {
      checkSoldOutItems();
    }

    // Set up interval to check periodically
    const interval = setInterval(checkSoldOutItems, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cartItems.length, wishlistItems.length, removeCartSoldOut]);

  // This component doesn't render anything
  return null;
}
