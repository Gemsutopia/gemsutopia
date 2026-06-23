'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Terms() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-white/60">
              Last updated: January 2026
            </p>
          </div>

          {/* Intro */}
          <p className="mb-8 text-center text-sm text-white/50">
            By accessing and using Gemsutopia, you agree to be bound by these terms.
          </p>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed text-white/50">
                By accessing and using Gemsutopia's website and services, you accept and agree to be
                bound by the terms and provision of this agreement. If you do not agree to abide by
                the above, please do not use this service.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Products and Services</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Gemsutopia offers premium gemstones and minerals, many of which are hand-mined and
                ethically sourced from Alberta, Canada. All product descriptions, images, and
                specifications are provided to the best of our knowledge and ability. We reserve
                the right to refuse service, terminate accounts, remove or edit content, or cancel
                orders in our sole discretion.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Orders and Payment</h2>
              <p className="text-sm leading-relaxed text-white/50">
                By placing an order through our website, you are making an offer to purchase products
                subject to these terms. All orders are subject to availability and confirmation.
                Payment is required at the time of purchase. We accept major credit cards, PayPal,
                and cryptocurrency. All prices are in Canadian dollars unless otherwise stated.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Shipping and Delivery</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Shipping times are estimates and may vary. We are not responsible for delays caused
                by shipping carriers, customs, or other factors beyond our control. Risk of loss and
                title for items purchased pass to you upon delivery to the shipping carrier.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Returns and Refunds</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Please see our Returns page for detailed information about returns, exchanges, and
                refunds. All returns must be authorized and comply with our return policy.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Intellectual Property</h2>
              <p className="text-sm leading-relaxed text-white/50">
                All content on this website, including text, graphics, logos, images, and software,
                is the property of Gemsutopia and is protected by copyright and other intellectual
                property laws.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Limitation of Liability</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Gemsutopia shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages, including but not limited to loss of profits, data, use, goodwill,
                or other intangible losses.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Changes to Terms</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting on the website. Your continued use of the service constitutes
                acceptance of the modified terms.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Questions about our terms?
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
