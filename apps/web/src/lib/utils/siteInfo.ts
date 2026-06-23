import { store } from '@/lib/store';

export interface SiteInfo {
  siteName: string;
  siteTagline: string;
  siteFavicon: string;
}

// Get all site info from Quickdash API (read-only)
export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const { site } = await store.site.getSettings();

    return {
      siteName: site.name || 'Gemsutopia',
      siteTagline: site.tagline || 'Discover the beauty of natural gemstones',
      siteFavicon: site.favicon || '/favicon.ico',
    };
  } catch {
    // Return defaults on error
    return {
      siteName: 'Gemsutopia',
      siteTagline: 'Discover the beauty of natural gemstones',
      siteFavicon: '/favicon.ico',
    };
  }
}
