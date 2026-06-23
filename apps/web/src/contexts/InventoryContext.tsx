'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface InventoryContextType {
  refreshShopProducts: () => void;
  refreshProduct: (productId: string) => void;
  shopRefreshTrigger: number;
  productRefreshTrigger: Record<string, number>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [shopRefreshTrigger, setShopRefreshTrigger] = useState(0);
  const [productRefreshTrigger, setProductRefreshTrigger] = useState<Record<string, number>>({});

  const refreshShopProducts = () => {
    setShopRefreshTrigger(prev => prev + 1);
  };

  const refreshProduct = (productId: string) => {
    setProductRefreshTrigger(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  return (
    <InventoryContext.Provider
      value={{
        refreshShopProducts,
        refreshProduct,
        shopRefreshTrigger,
        productRefreshTrigger,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
