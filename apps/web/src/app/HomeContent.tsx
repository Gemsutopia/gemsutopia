'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEvent } from '@/lib/pusher-client';
import dynamic from 'next/dynamic';
import GemCarousel from '@/components/home/GemCarousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AnimatedCounter from '@/components/home/AnimatedCounter';
import ProductMarquee from '@/components/home/ProductMarquee';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import ReviewModal from '@/components/modals/ReviewModal';
import { Accordion, AccordionItem } from '@heroui/react';
import { IconChevronDown } from '@tabler/icons-react';

// Lazy load heavy canvas component
const LightRays = dynamic(() => import('@/components/home/LightRays'), { ssr: false });

interface Review {
  id: string;
  reviewerName: string;
  content: string;
  rating: number;
  title?: string;
  isFeatured: boolean;
}

export interface CMSContent {
  id: string;
  section: string;
  key: string;
  content_type: string;
  value: string;
  is_active: boolean;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  inventory: number;
}

export interface Stat {
  id: string;
  title: string;
  value: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface HomeContentProps {
  initialContent: CMSContent[];
  initialStats: Stat[];
  initialFeaturedProducts: FeaturedProduct[];
  initialTestimonials: { id: number; name: string; text: string; rating: number }[];
  initialFaqItems: FAQItem[];
}

export default function HomeContent({
  initialContent,
  initialStats,
  initialFeaturedProducts,
  initialTestimonials,
  initialFaqItems,
}: HomeContentProps) {
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [content, setContent] = useState<CMSContent[]>(initialContent);
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(initialFeaturedProducts);
  const [testimonials, setTestimonials] = useState<{ id: number; name: string; text: string; rating: number }[]>(initialTestimonials);
  const [faqItems, setFaqItems] = useState<FAQItem[]>(initialFaqItems);

  // Helper to get content value
  const getContent = (section: string, key: string): string => {
    const item = content.find(c => c.section === section && c.key === key && c.is_active);
    return item?.value || '';
  };

  const getJsonContent = <T,>(section: string, key: string): T | null => {
    const item = content.find(c => c.section === section && c.key === key && c.is_active);
    if (item?.value) {
      try { return JSON.parse(item.value) as T; } catch { return null; }
    }
    return null;
  };

  // Real-time update handlers
  const handleContentUpdate = useCallback((eventData: { section?: string; key?: string; value?: string; refetch?: boolean }) => {
    if (eventData?.section && eventData?.key && eventData?.value !== undefined && !eventData?.refetch) {
      setContent(prev => {
        const idx = prev.findIndex(c => c.section === eventData.section && c.key === eventData.key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], value: eventData.value! };
          return updated;
        }
        return [...prev, { id: '', section: eventData.section!, key: eventData.key!, value: eventData.value!, content_type: 'text', is_active: true }];
      });
    } else {
      fetch('/api/site-content-public')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.success) setContent(data.data?.content || []); })
        .catch(() => {});
    }
  }, []);

  const refetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        const arr = data.data?.stats || data.stats || [];
        if (Array.isArray(arr)) setStats(arr);
      }
    } catch { /* silent */ }
  }, []);

  const refetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/featured-products');
      if (res.ok) {
        const data = await res.json();
        const products = data.data?.featuredProducts || [];
        if (Array.isArray(products)) setFeaturedProducts(products);
      }
    } catch { /* silent */ }
  }, []);

  const refetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?featured=true');
      if (res.ok) {
        const data = await res.json();
        const reviews = data.data?.reviews || [];
        if (reviews.length > 0) {
          setTestimonials(reviews.map((r: Review, i: number) => ({
            id: i + 1, name: r.reviewerName, text: r.content, rating: r.rating,
          })));
        }
      }
    } catch { /* silent */ }
  }, []);

  const refetchFaq = useCallback(async () => {
    try {
      const res = await fetch('/api/faq');
      if (res.ok) {
        const data = await res.json();
        const items = data.data?.faq || [];
        if (Array.isArray(items)) setFaqItems(items);
      }
    } catch { /* silent */ }
  }, []);

  // Pusher real-time listeners
  useEvent('content', 'content-updated', handleContentUpdate);
  useEvent('content', 'hero-updated', handleContentUpdate);
  useEvent('content', 'stats-updated', refetchStats);
  useEvent('content', 'stats-created', refetchStats);
  useEvent('content', 'stats-deleted', refetchStats);
  useEvent('content', 'featured-products-updated', refetchFeatured);
  useEvent('content', 'reviews-updated', refetchReviews);
  useEvent('content', 'faq-updated', refetchFaq);

  // Derived content values
  const heroImages = getJsonContent<{ id: number | string; name: string; image: string }[]>('hero', 'images') || [];
  const heroTitle = getContent('hero', 'title');
  const aboutTitle = getContent('about', 'title');
  const aboutText = getContent('about', 'text');
  const aboutImage = getContent('about', 'image');
  const earthTitle = getContent('earth_to_you', 'title');
  const earthText = getContent('earth_to_you', 'text');
  const earthImage = getContent('earth_to_you', 'image');
  const qualityTitle = getContent('quality', 'title');
  const qualityText = getContent('quality', 'text');
  const qualityImage = getContent('quality', 'image');
  const ctaTitle = getContent('cta', 'title');
  const ctaText = getContent('cta', 'text');
  const featuredTitle = getContent('featured', 'title');
  const faqTitle = getContent('faq', 'title');
  const reviewsTitle = getContent('reviews', 'title');

  const marqueeProducts = featuredProducts
    .filter(p => p.image_url && p.image_url.trim() !== '' && p.image_url !== '/images/placeholder.jpg')
    .map(p => ({
      id: p.id,
      name: p.name,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      image: p.image_url!,
      stock: p.inventory || 0,
    }));

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-black">
      <Header />

      {/* Hero Section */}
      <div className="relative z-10 h-[100svh]">
        {heroImages.length > 0 ? (
          <GemCarousel slides={heroImages} />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8">
          {heroTitle && (
            <h1 className="max-w-4xl text-center font-[family-name:var(--font-bacasime)] text-4xl leading-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
          )}
          <div className="pointer-events-auto mt-8 flex w-[calc(100%-2rem)] flex-col gap-4 sm:mt-12 sm:w-auto sm:flex-row">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                className={`h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg ${
                  secondaryHovered ? 'bg-white/10 text-white' : 'bg-white text-black hover:bg-white/90'
                }`}
                onMouseEnter={() => setSecondaryHovered(false)}
              >
                Shop Now
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className={`h-10 w-full rounded-md border-transparent px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg ${
                  secondaryHovered ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                onMouseEnter={() => setSecondaryHovered(true)}
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="relative z-10 bg-black px-2 py-4 sm:px-8 sm:py-6 md:px-16 lg:px-32">
          <div className="flex w-full justify-between">
            {stats.map(stat => (
              <div key={stat.id} className="p-1 text-center sm:p-4">
                <p className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-white sm:text-4xl">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-1 font-[family-name:var(--font-inter)] text-[8px] text-white/60 sm:mt-2 sm:text-xs">
                  {stat.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      {marqueeProducts.length > 0 && (
        <div className="relative z-10 min-h-screen overflow-hidden py-20">
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 sm:h-24"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)' }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <LightRays raysOrigin="top-center" raysColor="#ffffff" raysSpeed={1} lightSpread={1} rayLength={2} pulsating={false} fadeDistance={1.0} saturation={1.0} followMouse={false} mouseInfluence={0} />
          </div>
          {featuredTitle && (
            <h2 className="relative z-10 mb-12 px-4 text-center font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              {featuredTitle}
            </h2>
          )}
          <div className="relative">
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-4 bg-gradient-to-r from-black to-transparent sm:-top-16 sm:-bottom-16 sm:w-48 sm:rounded-r-3xl" />
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-4 bg-gradient-to-l from-black to-transparent sm:-top-16 sm:-bottom-16 sm:w-48 sm:rounded-l-3xl" />
            <ProductMarquee products={marqueeProducts} />
          </div>
          <div className="pointer-events-none absolute inset-0 z-20 opacity-50 sm:opacity-100" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
      )}

      {/* About Section */}
      {(aboutTitle || aboutText) && (
        <div className="relative z-30 px-2 py-12 sm:px-16 sm:py-16 md:px-32">
          <div className="pointer-events-none absolute -top-[150px] -right-[100px] z-50 h-[600px] w-[600px] rotate-[-30deg]" style={{ background: 'radial-gradient(ellipse 70% 50% at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          <div className="flex w-full flex-col-reverse items-center justify-between gap-8 md:flex-row md:gap-20">
            <div className="flex h-auto flex-1 flex-col justify-center px-4 sm:h-[28rem] sm:px-0 md:h-[36rem]">
              {aboutTitle && (
                <h2 className="mb-6 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                  {aboutTitle}
                </h2>
              )}
              {aboutText && aboutText.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 font-[family-name:var(--font-inter)] text-base leading-relaxed text-white/80 sm:text-lg">{paragraph}</p>
              ))}
            </div>
            {aboutImage && (
              <div className="w-full flex-shrink-0 md:w-auto">
                <img src={aboutImage} alt={aboutTitle || ''} className="aspect-square h-auto w-full rounded-2xl object-cover sm:h-[28rem] sm:w-[28rem] md:h-[36rem] md:w-[36rem]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* From Earth to You */}
      {(earthTitle || earthText) && (
        <div className="relative z-30 px-2 py-20 sm:px-16 sm:py-32 md:px-32">
          <div className="pointer-events-none absolute -top-[150px] -left-[100px] z-50 h-[600px] w-[600px] rotate-[30deg]" style={{ background: 'radial-gradient(ellipse 70% 50% at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          <div className="flex w-full flex-col-reverse items-center justify-between gap-8 md:flex-row-reverse md:gap-20">
            <div className="flex h-auto flex-1 flex-col justify-center px-4 sm:h-[28rem] sm:px-0 md:h-[36rem]">
              {earthTitle && (
                <h2 className="mb-6 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                  {earthTitle}
                </h2>
              )}
              {earthText && earthText.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 font-[family-name:var(--font-inter)] text-base leading-relaxed text-white/80 sm:text-lg">{paragraph}</p>
              ))}
            </div>
            {earthImage && (
              <div className="w-full flex-shrink-0 md:w-auto">
                <img src={earthImage} alt={earthTitle || ''} className="aspect-square h-auto w-full rounded-2xl object-cover sm:h-[28rem] sm:w-[28rem] md:h-[36rem] md:w-[36rem]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quality Section */}
      {(qualityTitle || qualityText) && (
        <div className="relative z-30 px-2 py-12 sm:px-16 sm:py-16 md:px-32">
          <div className="pointer-events-none absolute -top-[150px] -right-[100px] z-50 h-[600px] w-[600px] rotate-[-30deg]" style={{ background: 'radial-gradient(ellipse 70% 50% at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          <div className="flex w-full flex-col-reverse items-center justify-between gap-8 md:flex-row md:gap-20">
            <div className="flex h-auto flex-1 flex-col justify-center px-4 sm:h-[28rem] sm:px-0 md:h-[36rem]">
              {qualityTitle && (
                <h2 className="mb-6 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                  {qualityTitle}
                </h2>
              )}
              {qualityText && qualityText.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 font-[family-name:var(--font-inter)] text-base leading-relaxed text-white/80 sm:text-lg">{paragraph}</p>
              ))}
            </div>
            {qualityImage && (
              <div className="w-full flex-shrink-0 md:w-auto">
                <img src={qualityImage} alt={qualityTitle || ''} className="aspect-square h-auto w-full rounded-2xl object-cover sm:h-[28rem] sm:w-[28rem] md:h-[36rem] md:w-[36rem]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {(faqTitle || faqItems.length > 0) && (
        <div className="relative z-30 px-4 py-12 sm:px-16 sm:py-20 lg:px-24 xl:px-32">
          {faqTitle && (
            <h2 className="mb-10 text-center font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              {faqTitle}
            </h2>
          )}
          {faqItems.length > 0 && (
            <div className="mx-auto max-w-3xl lg:max-w-none">
              <Accordion
                className="px-0"
                disableIndicatorAnimation
                itemClasses={{
                  base: 'py-0 border-b border-white/10',
                  title: 'text-base font-medium text-white text-left sm:text-lg',
                  trigger: 'py-4 data-[hover=true]:bg-transparent justify-start',
                  indicator: 'text-white/40',
                  content: 'pt-0 pb-4 text-white/70 font-[family-name:var(--font-inter)] text-sm sm:text-base leading-relaxed',
                }}
              >
                {faqItems.map((item) => (
                  <AccordionItem key={item.id} aria-label={item.question} title={item.question} indicator={<IconChevronDown size={16} className="text-white/40" />}>
                    {item.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="relative z-10 bg-black py-12 sm:py-20">
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 sm:h-24" style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)' }} />
          {reviewsTitle && (
            <h2 className="mb-12 px-8 text-center font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              {reviewsTitle}
            </h2>
          )}
          <div className="relative">
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r from-black to-transparent sm:w-48" />
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-gradient-to-l from-black to-transparent sm:w-48" />
            <TestimonialMarquee testimonials={testimonials} />
          </div>
          <div className="mt-10 text-center">
            <Button type="button" onClick={(e) => { e.preventDefault(); setReviewModalOpen(true); }} className="h-10 rounded-md bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:h-11 sm:rounded-lg sm:px-10 sm:text-lg">
              Leave a Review
            </Button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {(ctaTitle || ctaText) && (
        <div className="relative z-10 overflow-hidden bg-black px-8 py-20 sm:px-16 sm:py-32 md:px-32">
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 sm:h-24" style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-0 rotate-180 opacity-70">
            <LightRays raysOrigin="top-center" raysColor="#ffffff" raysSpeed={1} lightSpread={2} rayLength={3} pulsating={false} fadeDistance={1.0} saturation={0} followMouse={false} mouseInfluence={0} />
          </div>
          <div className="pointer-events-none absolute inset-0 z-5 opacity-50 sm:opacity-100" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)' }} />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {ctaTitle && (
              <h2 className="mb-6 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                {ctaTitle}
              </h2>
            )}
            {ctaText && (
              <p className="mx-auto mb-10 max-w-2xl font-[family-name:var(--font-inter)] text-lg text-white/70 sm:text-xl">{ctaText}</p>
            )}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button className="h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg">
                  Shop Now
                </Button>
              </Link>
              <Link href="/contact-us" className="w-full sm:w-auto">
                <Button variant="outline" className="h-10 w-full rounded-md border-transparent bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mt-auto">
        <Footer />
      </div>

      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} />
    </div>
  );
}
