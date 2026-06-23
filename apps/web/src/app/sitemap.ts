import { MetadataRoute } from 'next';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch products from Quickdash Storefront API
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { products } = await store.products.list({ limit: 100 });
    productPages = products.map(product => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Storefront API unavailable, skip product pages
  }

  // Fetch categories from Quickdash Storefront API
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const { categories } = await store.categories.list();
    categoryPages = categories.map(category => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Storefront API unavailable, skip category pages
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
