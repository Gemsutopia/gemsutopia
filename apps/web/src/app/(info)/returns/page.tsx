'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const defaultContent: Record<string, string> = {
  subtitle: 'Your satisfaction matters to us',
  intro: "If for any reason you're not completely happy with your purchase, we're here to help.",
  policy: 'You may return most items within 30 days of delivery for a full refund. Items must be in their original condition with all packaging intact.',
  how_to_return: '• Contact us to initiate your return\n• We\'ll provide return instructions and shipping address\n• Pack your item securely in its original packaging\n• Ship the item back (return shipping is buyer\'s responsibility)',
  exchanges: "Want to exchange for a different item? Contact us and we'll help you find the perfect piece. Exchanges are subject to availability.",
  damaged_items: "If your item arrives damaged, contact us immediately with photos. We'll make it right with a replacement or full refund, including shipping costs.",
  non_returnable: 'Custom or personalized items and sale/clearance items marked as final sale cannot be returned unless they arrive damaged or defective.',
};

export default function Returns() {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/pages/returns')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.content && Object.keys(data.data.content).length > 0) {
          setContent(data.data.content);
        }
      })
      .catch(() => {});
  }, []);

  const get = (key: string) => content[key] || defaultContent[key] || '';

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
              Returns & Exchanges
            </h1>
            <p className="text-sm text-white/60">
              {get('subtitle')}
            </p>
          </div>

          {/* Intro */}
          <p className="mb-8 text-center text-sm text-white/50">
            {get('intro')}
          </p>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Return Policy</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('policy')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">How to Return</h2>
              <div className="space-y-1.5 text-sm leading-relaxed text-white/50">
                {get('how_to_return').split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Exchanges</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('exchanges')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Damaged Items</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('damaged_items')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Non-Returnable Items</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('non_returnable')}
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Questions about returns?
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
