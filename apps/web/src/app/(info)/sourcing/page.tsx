'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyState } from '@/components/empty-states';

export default function EthicalSourcing() {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(true);

  useEffect(() => {
    fetch('/api/pages/sourcing')
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
    title: 'Ethical Sourcing',
    subtitle: 'Integrity in every specimen',
    section_1_title: 'Our Commitment',
    section_1_content: 'We believe beautiful gemstones shouldn\'t come at the cost of environmental damage or unfair labor practices. Every specimen in our collection is sourced with careful consideration for both people and planet.',
    section_2_title: 'Direct Relationships',
    section_2_content: 'We work directly with small-scale miners and family-operated businesses whenever possible. These partnerships ensure fair compensation reaches the people who actually extract these treasures from the earth.',
    section_3_title: 'Canadian Specimens',
    section_3_content: 'Many pieces in our collection are personally collected during rockhounding expeditions across Alberta and other Canadian locations. These firsthand discoveries allow us to offer specimens with complete provenance.',
    section_4_title: 'Transparency',
    section_4_content: 'We provide detailed origin information for our specimens whenever available. If we don\'t know exactly where a stone came from, we\'ll tell you. Honesty builds the trust that lasting relationships require.',
    section_5_title: 'Sustainable Practices',
    section_5_content: 'We prioritize suppliers who employ sustainable extraction methods and rehabilitate mining sites. The mineral world has existed for millions of years—we\'re committed to practices that honor that legacy.',
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
            title="Ethical Sourcing"
            description="We're preparing detailed information about our ethical sourcing practices and partnerships. Stay tuned!"
            action={{ label: 'About Us', href: '/about' }}
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
              Questions about our sourcing practices?
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
