import HomeContent from './HomeContent';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch featured products from Quickdash Storefront API
  let featuredProducts: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    inventory: number;
  }> = [];

  try {
    const { products } = await store.products.list({ featured: true, limit: 8 });
    featuredProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      image_url: p.thumbnail || p.images?.[0] || null,
      inventory: 99,
    }));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }

  // Fetch site content via Storefront API
  let initialContent: { id: string; section: string; key: string; content_type: string; value: string; is_active: boolean }[] = [];
  try {
    const { content } = await store.siteContent.list();
    initialContent = content
      .filter(item => item.value && item.key.includes(':'))
      .map(item => {
        const colonIdx = item.key.indexOf(':');
        return {
          id: item.id,
          section: item.key.slice(0, colonIdx),
          key: item.key.slice(colonIdx + 1),
          content_type: item.type,
          value: item.value!,
          is_active: true,
        };
      });
  } catch (error) {
    console.error('Failed to fetch site content:', error);
  }

  // Fetch stats via Storefront API
  let initialStats: { id: string; title: string; value: string }[] = [];
  try {
    const { stats } = await store.stats.list();
    initialStats = stats.map(s => ({ id: s.id, title: s.title, value: s.value }));
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  // Fetch testimonials via Storefront API
  let initialTestimonials: { id: number; name: string; text: string; rating: number }[] = [];
  try {
    const { testimonials } = await store.testimonials.list();
    const featured = testimonials.filter(t => t.isFeatured);
    const toShow = featured.length > 0 ? featured : testimonials;
    initialTestimonials = toShow.map((t, i) => ({
      id: i + 1,
      name: t.reviewerName,
      text: t.content,
      rating: t.rating,
    }));
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
  }

  // Fetch FAQ via Storefront API
  let initialFaqItems: { id: string; question: string; answer: string; sort_order: number }[] = [];
  try {
    const { faq } = await store.faq.list();
    initialFaqItems = faq.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sortOrder ?? 0,
    }));
  } catch (error) {
    console.error('Failed to fetch FAQ:', error);
  }

  return (
    <HomeContent
      initialContent={initialContent}
      initialStats={initialStats}
      initialFeaturedProducts={featuredProducts}
      initialTestimonials={initialTestimonials}
      initialFaqItems={initialFaqItems}
    />
  );
}
