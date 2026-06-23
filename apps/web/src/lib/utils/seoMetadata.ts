import { store } from '@/lib/store';

export interface SEOMetadata {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  siteName: string;
  siteUrl: string;
}

const defaults: SEOMetadata = {
  seoTitle: 'Gemsutopia - Authentic Gemstones from Alberta',
  seoDescription:
    "Hi, I'm Reese, founder of Gemsutopia and proud Canadian gem dealer from Alberta. Every gemstone is hand-selected, ethically sourced, and personally verified for quality.",
  seoKeywords:
    'gemstones, crystals, amethyst, quartz, minerals, Alberta gems, Canadian gemstones, natural crystals, hand-mined, ethical sourcing',
  seoAuthor: 'Gemsutopia',
  openGraphTitle: '',
  openGraphDescription: '',
  openGraphImage: '/logos/gems-logo.png',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '/logos/gems-logo.png',
  siteName: 'Gemsutopia',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com',
};

// Fetch SEO settings from Quickdash API
export async function getSEOMetadataFromDB(): Promise<SEOMetadata> {
  try {
    const { site } = await store.site.getSettings();

    return {
      seoTitle: site.seo?.title || defaults.seoTitle,
      seoDescription: site.seo?.description || defaults.seoDescription,
      seoKeywords: site.seo?.keywords || defaults.seoKeywords,
      seoAuthor: site.seo?.author || defaults.seoAuthor,
      openGraphTitle: site.seo?.openGraphTitle || defaults.openGraphTitle,
      openGraphDescription: site.seo?.openGraphDescription || defaults.openGraphDescription,
      openGraphImage: site.seo?.openGraphImage || defaults.openGraphImage,
      twitterTitle: site.seo?.twitterTitle || defaults.twitterTitle,
      twitterDescription: site.seo?.twitterDescription || defaults.twitterDescription,
      twitterImage: site.seo?.twitterImage || defaults.twitterImage,
      siteName: site.name || defaults.siteName,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || defaults.siteUrl,
    };
  } catch {
    return defaults;
  }
}

// In-memory cache for client-side updates
let seoCache: SEOMetadata | null = null;

// Sync getter for client-side (returns cached or defaults)
export function getSEOMetadata(): SEOMetadata {
  return seoCache || defaults;
}

// Update in-memory cache (called after admin updates)
export function updateSEOMetadata(updates: Partial<SEOMetadata>) {
  seoCache = { ...(seoCache || defaults), ...updates };
}

// Get defaults (useful for fallbacks)
export function getSEODefaults(): SEOMetadata {
  return defaults;
}
