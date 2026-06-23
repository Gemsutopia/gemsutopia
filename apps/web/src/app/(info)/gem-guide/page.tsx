'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyState } from '@/components/empty-states';

export default function GemGuide() {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(true);

  useEffect(() => {
    fetch('/api/pages/gem-guide')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setContent(data);
          setHasContent(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const defaultContent: Record<string, string> = {
    title: 'Gem Guide',
    subtitle: 'Understanding nature\'s treasures',
    section_1_title: 'What Makes a Gemstone Valuable',
    section_1_content: 'The value of a gemstone is determined by the four Cs: color, clarity, cut, and carat weight. However, rarity and origin also play significant roles. A stone\'s provenance can dramatically affect its desirability among collectors.',
    section_2_title: 'Color & Clarity',
    section_2_content: 'Color is often the most important factor. The most prized specimens exhibit vivid, saturated hues with even distribution. Clarity refers to the absence of inclusions—though some inclusions, like rutile needles in quartz, can actually enhance a stone\'s beauty and value.',
    section_3_title: 'Natural vs. Enhanced',
    section_3_content: 'We specialize in natural, untreated specimens. While heat treatment and other enhancements are common in the industry, our collection focuses on stones that showcase nature\'s artistry without artificial modification.',
    section_4_title: 'Identifying Authenticity',
    section_4_content: 'Authentic gemstones often contain natural inclusions, growth patterns, and slight imperfections that distinguish them from synthetics. We provide detailed photographs and honest descriptions so you know exactly what you\'re acquiring.',
    section_5_title: 'Building Your Collection',
    section_5_content: 'Start with stones that speak to you personally. Whether drawn to the flash of labradorite or the ancient beauty of ammolite, collecting should be a journey of discovery. Quality over quantity is the collector\'s golden rule.',
  };

  const getContent = (key: string): string => content[key] || defaultContent[key] || '';

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <main className="flex grow items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasContent && Object.keys(content).length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <main className="flex grow items-center justify-center px-4">
          <EmptyState
            title="Gem Guide Coming Soon"
            description="We're working on a comprehensive guide to help you learn about gemstones, their properties, and how to identify quality specimens."
            action={{ label: 'Browse Shop', href: '/shop' }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="relative min-h-screen grow overflow-hidden px-4 py-24 sm:px-8 md:px-16 lg:px-32">
        {/* Background gem logo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/logos/gem2.svg"
            alt=""
            width={800}
            height={800}
            className="h-[120vw] w-[120vw] animate-[spin_60s_linear_infinite] opacity-[0.06] drop-shadow-[0_0_80px_rgba(255,255,255,0.3)] sm:h-[600px] sm:w-[600px]"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-4xl text-white">
              {getContent('title')}
            </h1>
            <p className="text-sm text-white/60">{getContent('subtitle')}</p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">
                {getContent('section_1_title')}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {getContent('section_1_content')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">
                {getContent('section_2_title')}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {getContent('section_2_content')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">
                {getContent('section_3_title')}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {getContent('section_3_content')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">
                {getContent('section_4_title')}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {getContent('section_4_content')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">
                {getContent('section_5_title')}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {getContent('section_5_content')}
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Have questions about a specific gemstone?
            </p>
            <Link
              href="/contact-us"
              className="block h-10 w-full rounded-md bg-white/10 pt-2.5 text-center font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:mx-auto sm:w-auto sm:px-10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
