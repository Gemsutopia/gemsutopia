'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Support() {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/support')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const defaultContent: Record<string, string> = {
    title: 'Support',
    subtitle: "We're here to help",
    email_address: 'gemsutopia@gmail.com',
    response_time_value: '24 hours',
    faq_1_question: 'How do I track my order?',
    faq_1_answer:
      "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our shipping partner's website.",
    faq_2_question: 'What is your return policy?',
    faq_2_answer:
      'We offer a 30-day return policy for all items in original condition. Please contact us at gemsutopia@gmail.com for detailed return information.',
    faq_3_question: 'Are your gemstones authentic?',
    faq_3_answer:
      'Yes, all our gemstones come with certificates of authenticity and are sourced from trusted suppliers worldwide.',
    faq_4_question: 'How long does shipping take?',
    faq_4_answer:
      'Standard shipping takes 3-5 business days. Express shipping options are available at checkout for faster delivery.',
  };

  const getContent = (key: string): string => content[key] || defaultContent[key] || '';

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

          {/* Contact info */}
          <div className="mb-12 text-center">
            <a
              href={`mailto:${getContent('email_address')}`}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              {getContent('email_address')}
            </a>
            <p className="mt-1 text-xs text-white/40">
              Response within {getContent('response_time_value')}
            </p>
          </div>

          {/* FAQ Section */}
          <div id="faq">
            <h2 className="mb-6 text-center text-sm font-medium tracking-wide text-white/40 uppercase">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
                <h3 className="mb-2 text-sm font-medium text-white">
                  {getContent('faq_1_question')}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {getContent('faq_1_answer')}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
                <h3 className="mb-2 text-sm font-medium text-white">
                  {getContent('faq_2_question')}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {getContent('faq_2_answer')}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
                <h3 className="mb-2 text-sm font-medium text-white">
                  {getContent('faq_3_question')}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {getContent('faq_3_answer')}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
                <h3 className="mb-2 text-sm font-medium text-white">
                  {getContent('faq_4_question')}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {getContent('faq_4_answer')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Can't find what you're looking for?
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
