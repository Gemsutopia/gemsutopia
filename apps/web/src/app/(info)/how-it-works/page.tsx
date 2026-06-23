'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyState } from '@/components/empty-states';

export default function HowItWorks() {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(true);

  useEffect(() => {
    fetch('/api/pages/how-it-works')
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
    title: 'How It Works',
    subtitle: 'From earth to your collection',
    section_1_title: 'Discovery & Sourcing',
    section_1_content: 'Every piece begins with careful sourcing. Some specimens are personally collected during rockhounding expeditions across Canada, while others come from trusted small-scale miners and suppliers who share our commitment to ethical practices.',
    section_2_title: 'Selection & Inspection',
    section_2_content: 'Each gemstone undergoes thorough inspection before joining our collection. We evaluate color, clarity, and overall quality, ensuring only specimens we\'d proudly add to our own collection make it to yours.',
    section_3_title: 'Documentation & Photography',
    section_3_content: 'We photograph every piece in natural lighting from multiple angles. Our listings include accurate measurements, weight, and honest descriptions of any natural characteristics. What you see is exactly what you\'ll receive.',
    section_4_title: 'Secure Packaging',
    section_4_content: 'Your gemstone is carefully wrapped in protective materials and placed in a secure box designed to prevent movement during transit. We treat every shipment as if we\'re sending a piece of our personal collection.',
    section_5_title: 'Delivery & Support',
    section_5_content: 'Once shipped, you\'ll receive tracking information via email. Our support doesn\'t end at delivery—we\'re here to answer questions about your specimen, provide care advice, or assist with any concerns.',
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
            title="How It Works"
            description="We're putting together a guide explaining our process from sourcing to delivery. Check back soon!"
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
              Want to learn more about our process?
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
