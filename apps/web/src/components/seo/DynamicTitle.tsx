'use client';
import { useEffect, useState } from 'react';

interface DynamicTitleProps {
  fallback?: string;
  pageTitle?: string;
}

export default function DynamicTitle({ fallback = 'Gemsutopia', pageTitle }: DynamicTitleProps) {
  const [siteName, setSiteName] = useState(fallback);

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const response = await fetch('/api/site-info');
        if (response.ok) {
          const data = await response.json();
          setSiteName(data.siteName || fallback);
        }
      } catch {
        // Keep fallback name
      }
    };

    fetchSiteName();

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      setTimeout(fetchSiteName, 500);
    };

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site-settings-updated') {
        fetchSiteName();
      }
    };

    window.addEventListener('settings-updated', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fallback]);

  useEffect(() => {
    const title = pageTitle ? `${pageTitle} - ${siteName}` : siteName;
    document.title = title;
  }, [siteName, pageTitle]);

  return null; // This component doesn't render anything
}
