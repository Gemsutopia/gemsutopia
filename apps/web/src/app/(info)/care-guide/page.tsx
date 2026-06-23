'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyState } from '@/components/empty-states';

export default function CareGuide() {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(true);

  useEffect(() => {
    fetch('/api/pages/care-guide')
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
    title: 'Care Guide',
    subtitle: 'Preserving nature\'s beauty',
    section_1_title: 'General Handling',
    section_1_content: 'Always handle your specimens with clean, dry hands. Natural oils and lotions can affect the surface of certain minerals over time. When possible, hold pieces by their edges or base rather than their display faces.',
    section_2_title: 'Cleaning Your Specimens',
    section_2_content: 'Most specimens can be gently dusted with a soft brush. For deeper cleaning, use lukewarm water and mild soap, then dry thoroughly. Avoid ultrasonic cleaners and harsh chemicals—they can damage delicate surfaces and alter colors.',
    section_3_title: 'Display & Storage',
    section_3_content: 'Keep specimens away from direct sunlight, which can fade certain minerals like amethyst and rose quartz. Store pieces individually in soft cloth or padded containers to prevent scratching. Humidity control helps preserve specimens long-term.',
    section_4_title: 'Temperature Considerations',
    section_4_content: 'Avoid exposing your gemstones to extreme temperature changes. Rapid shifts can cause thermal shock, potentially leading to fractures in some specimens. Room temperature with stable conditions is ideal.',
    section_5_title: 'Special Care Notes',
    section_5_content: 'Some minerals require specific care. Labradorite should be kept dry. Ammolite benefits from occasional light oiling. If you\'re unsure about caring for a specific specimen, reach out—we\'re happy to provide guidance tailored to your piece.',
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
            title="Care Guide Coming Soon"
            description="We're creating a comprehensive guide on how to properly care for and maintain your gemstones."
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
              Need specific care advice for your specimen?
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
