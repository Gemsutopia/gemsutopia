'use client';
import { useEffect, useRef } from 'react';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { store } from '@/lib/store';
import { toast } from 'sonner';

export default function SoldOutItemsMonitor() {
  const {
    items: cartItems,
    removeSoldOutItems: removeCartSoldOut,
    reconcileItemStock,
  } = useGemPouch();
  const lastCheckRef = useRef<number>(0);
  const cartItemsRef = useRef(cartItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    const checkSoldOutItems = async () => {
      // Don't check too frequently (every 30 seconds max)
      const now = Date.now();
      if (now - lastCheckRef.current < 30000) {
        return;
      }
      lastCheckRef.current = now;

      try {
        const currentItems = cartItemsRef.current;
        if (currentItems.length === 0) return;

        const results = await Promise.allSettled(
          currentItems.map(async item => {
            const { product } = await store.products.get(item.id);
            const availableStock = product.stock?.length
              ? item.variantId
                ? Math.max(
                    0,
                    product.stock.find(stock => stock.variantId === item.variantId)?.quantity ?? 0
                  )
                : product.stock.reduce(
                    (total, stock) => total + Math.max(0, stock.quantity),
                    0
                  )
              : 0;
            return { item, availableStock };
          })
        );

        const verifiedItems = results.flatMap(result =>
          result.status === 'fulfilled' ? [result.value] : []
        );
        const soldOutCartItems = verifiedItems
          .filter(({ availableStock }) => availableStock === 0)
          .map(({ item }) => item);

        if (soldOutCartItems.length > 0) {
          const soldOutItemIds = soldOutCartItems.map(item => item.id);
          removeCartSoldOut(soldOutItemIds);
        }

        const reducedItems = verifiedItems.filter(
          ({ item, availableStock }) => availableStock > 0 && item.quantity > availableStock
        );
        for (const { item, availableStock } of reducedItems) {
          reconcileItemStock(item.id, availableStock);
        }
        if (reducedItems.length > 0) {
          toast.warning(
            reducedItems.length === 1
              ? `${reducedItems[0].item.name} quantity was updated to match available stock.`
              : `${reducedItems.length} cart quantities were updated to match available stock.`
          );
        }

        for (const { item, availableStock } of verifiedItems) {
          if (availableStock > 0 && item.quantity <= availableStock) {
            reconcileItemStock(item.id, availableStock);
          }
        }
      } catch {
        // Inventory checks are advisory. Leave the cart untouched if Quickdash is unavailable.
      }
    };

    if (cartItemsRef.current.length > 0) {
      checkSoldOutItems();
    }

    const interval = setInterval(checkSoldOutItems, 60000);

    return () => clearInterval(interval);
  }, [removeCartSoldOut, reconcileItemStock]);

  // This component doesn't render anything
  return null;
}
