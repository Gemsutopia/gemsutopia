'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@heroui/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const tabContent: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: 'All Gems', href: '/shop' },
    { label: 'New Arrivals', href: '/shop/new-arrivals' },
    { label: 'Featured', href: '/shop/featured' },
    { label: 'Rare Finds', href: '/shop/rare-finds' },
  ],
  Auctions: [
    { label: 'All Auctions', href: '/auctions' },
    { label: 'Live Now', href: '/auctions/live' },
    { label: 'Ending Soon', href: '/auctions/ending-soon' },
    { label: 'Upcoming', href: '/auctions/upcoming' },
  ],
  Learn: [
    { label: 'Gem Guide', href: '/gem-guide' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Ethical Sourcing', href: '/sourcing' },
    { label: 'Care Guide', href: '/care-guide' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact-us' },
    { label: 'Support', href: '/support' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ],
};

const tabs = Object.keys(tabContent);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<string>('Shop');
  const { currency, setCurrency } = useCurrency();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setIsSubscribing(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <footer className="relative z-10 flex h-auto min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden border-t border-white/10 bg-black py-10 text-white xs:min-h-[55vh] xs:py-12 md:min-h-[60vh] md:py-16 lg:py-20">
      {/* Footer Content */}
      <div className="relative z-10 w-full px-4 xs:px-5 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40">
        {/* Mobile Accordion Navigation */}
        <div className="mb-4 md:hidden">
          <Accordion
            className="px-0"
            disableIndicatorAnimation
            itemClasses={{
              base: 'py-0 border-none',
              title: 'text-sm font-medium text-white text-left',
              trigger: 'py-3 data-[hover=true]:bg-transparent justify-start',
              indicator: 'text-white/40',
              content: 'pt-0 pb-4',
            }}
          >
            {tabs.map(tab => (
              <AccordionItem
                key={tab}
                aria-label={tab}
                title={tab}
                indicator={<IconChevronDown size={16} className="text-white/40" />}
              >
                <div className="flex flex-col gap-3">
                  {tabContent[tab]?.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Mobile Newsletter */}
          <div className="mt-4 rounded-xl border border-white/[0.03] bg-white/5 p-4">
            <p className="mb-3 text-sm text-white/60">
              Stay updated with exclusive offers and new arrivals
            </p>
            <form onSubmit={handleSubscribe} className="flex w-full">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-10 flex-1 rounded-l-lg border border-r-0 border-white/[0.03] bg-white/5 px-4 text-sm text-white placeholder-white/40 transition-colors focus:border-white/10 focus:outline-none"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="h-10 rounded-r-lg border border-white/[0.03] bg-white/10 px-6 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
              >
                {isSubscribing ? '...' : status === 'success' ? 'Done!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Tabbed Navigation */}
        <div className="mb-4 hidden md:mb-6 md:block lg:mb-8">
          {/* Tabs and Currency */}
          <div className="flex items-center justify-between">
            <div className="flex gap-5 md:gap-8 lg:gap-10 xl:gap-12">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              className="pb-3 text-sm text-white/60 transition-colors hover:text-white"
              onClick={() => setCurrency(currency === 'USD' ? 'CAD' : 'USD')}
            >
              {currency === 'USD' ? (
                <>
                  <span className="fi fi-us mr-1.5" /> America <span className="text-white/50">(USD)</span>
                </>
              ) : (
                <>
                  <span className="fi fi-ca mr-1.5" /> Canada <span className="text-white/50">(CAD)</span>
                </>
              )}
            </button>
          </div>
          {/* Horizontal Line */}
          <div className="h-[0.5px] w-full bg-white/[0.06]" />

          {/* Content Card */}
          <div className="mt-4 w-full md:mt-5 lg:mt-6">
            <div className="flex min-h-[180px] flex-col justify-between rounded-xl border border-white/[0.06] bg-white/5 p-5 md:min-h-[200px] md:p-6 lg:min-h-[220px] lg:p-8 xl:p-10">
              {/* Page Links */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 md:gap-x-8 md:gap-y-3 lg:gap-x-10 lg:gap-y-4">
                {tabContent[activeTab]?.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="mt-6 md:mt-8 lg:mt-10">
                <p className="mb-2.5 text-sm text-white/60 md:mb-3 lg:text-base">
                  Stay updated with exclusive offers and new arrivals
                </p>
                <form onSubmit={handleSubscribe} className="flex w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 flex-1 rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none md:h-11 lg:h-12 lg:px-5"
                    disabled={isSubscribing}
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="h-10 rounded-r-lg border border-white/10 bg-white/10 px-5 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50 md:h-11 md:px-6 lg:h-12 lg:px-8"
                  >
                    {isSubscribing ? '...' : status === 'success' ? 'Done!' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="mb-2 flex items-center justify-between py-3 xs:py-4 md:mb-3 md:py-5 lg:py-6">
          <p className="text-[11px] text-white/60 xs:text-xs md:text-sm">© 2026 Gemsutopia</p>
          <div className="flex gap-3 xs:gap-4 md:gap-5 lg:gap-6">
            <a
              href="/terms"
              className="text-[11px] text-white/60 transition-colors hover:text-white xs:text-xs md:text-sm"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-[11px] text-white/60 transition-colors hover:text-white xs:text-xs md:text-sm"
            >
              Privacy
            </a>
            <a
              href="/cookies"
              className="text-[11px] text-white/60 transition-colors hover:text-white xs:text-xs md:text-sm"
            >
              Cookies
            </a>
          </div>
        </div>

        {/* Large Logo */}
        <div className="w-full 3xl:mx-auto 3xl:max-w-[1600px]">
          <Image
            src="/logos/lgoo.svg"
            alt="Gemsutopia"
            width={1200}
            height={1200}
            className="h-auto w-full object-contain opacity-25 md:opacity-30"
          />
        </div>
      </div>
    </footer>
  );
}
