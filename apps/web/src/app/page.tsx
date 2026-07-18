import HomeContent from './HomeContent';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  inventory: number;
};

type ContentItem = {
  id: string;
  section: string;
  key: string;
  content_type: string;
  value: string;
  is_active: boolean;
};

async function loadFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const { products } = await store.products.list({ featured: true, limit: 8 });
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number.parseFloat(product.price),
      image_url: product.thumbnail || product.images?.[0] || null,
      inventory: product.stock?.reduce((total, stock) => total + stock.quantity, 0) ?? 0,
    }));
  } catch {
    return [];
  }
}

async function loadContent(): Promise<ContentItem[]> {
  try {
    const { content } = await store.siteContent.list();
    return content
      .filter(item => item.value && item.key.includes(':'))
      .map(item => {
        const colonIndex = item.key.indexOf(':');
        return {
          id: item.id,
          section: item.key.slice(0, colonIndex),
          key: item.key.slice(colonIndex + 1),
          content_type: item.type,
          value: item.value!,
          is_active: true,
        };
      });
  } catch {
    return [];
  }
}

async function loadStats() {
  try {
    const { stats } = await store.stats.list();
    return stats.map(stat => ({ id: stat.id, title: stat.title, value: stat.value }));
  } catch {
    return [];
  }
}

async function loadTestimonials() {
  try {
    const { testimonials } = await store.testimonials.list();
    const featured = testimonials.filter(testimonial => testimonial.isFeatured);
    return (featured.length > 0 ? featured : testimonials).map((testimonial, index) => ({
      id: index + 1,
      name: testimonial.reviewerName,
      text: testimonial.content,
      rating: testimonial.rating,
    }));
  } catch {
    return [];
  }
}

async function loadFaq() {
  try {
    const { faq } = await store.faq.list();
    return faq.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sortOrder ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featuredProducts, initialContent, initialStats, initialTestimonials, initialFaqItems] =
    await Promise.all([
      loadFeaturedProducts(),
      loadContent(),
      loadStats(),
      loadTestimonials(),
      loadFaq(),
    ]);

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
