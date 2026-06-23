'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RefundPolicy() {
  const [content, setContent] = useState<any>({});

  useEffect(() => {
    fetch('/api/pages/refund-policy')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(() => {});
  }, []);

  const defaultContent: Record<string, string> = {
    title: 'Refund Policy',
    subtitle: 'Last updated: January 2026',
    guarantee_title: '30-Day Money Back Guarantee',
    guarantee_content:
      "We stand behind the quality of our products. If you're not completely satisfied with your purchase, you may return it within 30 days of delivery for a full refund.",
    process_title: 'Refund Process',
    process_item_1: 'Contact our customer service team to initiate a return',
    process_item_2: 'Return items must be in original condition with all packaging',
    process_item_3: 'Refunds are processed within 5-7 business days after we receive your return',
    process_item_4: 'Original shipping costs are non-refundable',
    exceptions_title: 'Exceptions',
    exceptions_content:
      'Custom or personalized items cannot be returned unless defective. Sale items are final sale and cannot be returned for refund, but may be exchanged for store credit.',
    damaged_title: 'Damaged or Defective Items',
    damaged_content:
      'If you receive a damaged or defective item, please contact us immediately. We will provide a prepaid return label and process your refund or replacement as soon as possible.',
    contact_title: 'Contact Us',
    contact_content:
      'For questions about our refund policy or to initiate a return, please contact us at gemsutopia@gmail.com.',
  };

  const getContent = (key: string): string => content[key] || defaultContent[key] || '';

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <div className="min-h-screen flex-1 px-4 py-32 sm:px-8 md:px-16 lg:px-32">
        <div className="w-full">
          <h1 className="mb-2 text-center font-(family-name:--font-cormorant)] text-4xl text-white sm:text-5xl md:text-6xl">
            {getContent('title')}
          </h1>
          <p className="mb-8 text-center font-(family-name:--font-inter)] text-sm text-white/50">
            {getContent('subtitle')}
          </p>

          <div className="space-y-8 text-left font-(family-name:--font-inter)] text-sm leading-relaxed text-white/80 sm:text-base">
            <section>
              <h2 className="mb-3 font-(family-name:--font-cormorant)] text-2xl text-white sm:text-3xl">
                {getContent('guarantee_title')}
              </h2>
              <p>{getContent('guarantee_content')}</p>
            </section>

            <section>
              <h2 className="mb-3 font-(family-name:--font-cormorant)] text-2xl text-white sm:text-3xl">
                {getContent('process_title')}
              </h2>
              <ul className="ml-6 list-disc space-y-2 text-white/70">
                <li>{getContent('process_item_1')}</li>
                <li>{getContent('process_item_2')}</li>
                <li>{getContent('process_item_3')}</li>
                <li>{getContent('process_item_4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-(family-name:--font-cormorant)] text-2xl text-white sm:text-3xl">
                {getContent('exceptions_title')}
              </h2>
              <p>{getContent('exceptions_content')}</p>
            </section>

            <section>
              <h2 className="mb-3 font-(family-name:--font-cormorant)] text-2xl text-white sm:text-3xl">
                {getContent('damaged_title')}
              </h2>
              <p>{getContent('damaged_content')}</p>
            </section>

            <section>
              <h2 className="mb-3 font-(family-name:--font-cormorant)] text-2xl text-white sm:text-3xl">
                {getContent('contact_title')}
              </h2>
              <p>{getContent('contact_content')}</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
