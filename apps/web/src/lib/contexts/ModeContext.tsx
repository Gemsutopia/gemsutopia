'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { store } from '@/lib/store';

export type SiteMode = 'live' | 'maintenance' | 'sandbox';

interface ModeContextType {
  mode: SiteMode;
  maintenanceMessage: string;
  loading: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SiteMode>('live');
  const [maintenanceMessage, setMaintenanceMessage] = useState("We'll be back soon.");
  const [loading, setLoading] = useState(true);

  const fetchSiteMode = useCallback(async () => {
    try {
      const result = await store.site.getSettings();
      const site = result.site as any;

      if (site.maintenance?.enabled) {
        setMode('maintenance');
        setMaintenanceMessage(site.maintenance.message || "We'll be back soon.");
      } else if (site.sandbox?.enabled) {
        setMode('sandbox');
      } else {
        setMode('live');
      }
    } catch {
      // API not available — default to live
      setMode('live');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch mode on mount
  useEffect(() => {
    fetchSiteMode();
  }, [fetchSiteMode]);

  // Poll for mode changes every 30 seconds (admin might toggle it)
  useEffect(() => {
    const interval = setInterval(fetchSiteMode, 30000);
    return () => clearInterval(interval);
  }, [fetchSiteMode]);

  return (
    <ModeContext.Provider value={{ mode, maintenanceMessage, loading }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
