'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const defaultContent: Record<string, string> = {
  subtitle: 'Fast and secure delivery',
  processing_time: '1–2 business days',
  canada_time: '3–15 business days estimated delivery',
  usa_time: '5–20 business days estimated delivery',
  international_note: 'Contact us for international shipping options and estimates.',
};

export default function Shipping() {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/pages/shipping')
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
              Shipping
            </h1>
            <p className="text-sm text-white/60">
              {get('subtitle')}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Processing Time</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('processing_time')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Canada</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('canada_time')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">USA</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('usa_time')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">International</h2>
              <p className="text-sm leading-relaxed text-white/50">
                {get('international_note')}
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Questions about shipping?
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
