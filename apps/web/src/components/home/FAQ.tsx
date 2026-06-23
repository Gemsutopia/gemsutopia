'use client';
import { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

export default function FAQ() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      const response = await fetch('/api/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data);
      }
    } catch {
      // Error fetching FAQ
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    if (openItems.has(id)) {
      // Close the currently open item
      setOpenItems(new Set());
    } else {
      // Close all items and open only the clicked one
      setOpenItems(new Set([id]));
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-1">
        <div className="flex w-full flex-col items-start justify-between gap-8 lg:flex-row lg:gap-4">
          <div className="w-full lg:w-1/2">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="max-w-xl text-lg text-white drop-shadow-lg">
              Find answers to common questions about our gemstones, shipping, and services
            </p>
          </div>

          <div className="w-full space-y-4 pr-0 lg:ml-auto lg:w-[600px]">
            {faqItems.slice(0, 4).map(item => {
              const isOpen = openItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg bg-black/80 backdrop-blur-md"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 hover:bg-white/10"
                  >
                    <span className="pr-4 text-lg font-medium text-white">{item.question}</span>
                    {isOpen ? (
                      <IconChevronUp size={20} className="flex-shrink-0 text-white" />
                    ) : (
                      <IconChevronDown size={20} className="flex-shrink-0 text-white" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-white/5 px-6 pb-4">
                      <div className="pt-2">
                        <p className="leading-relaxed text-white/80">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white">
            Still have questions?{' '}
            <a
              href="mailto:support@gemsutopia.com"
              className="font-medium text-white hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
