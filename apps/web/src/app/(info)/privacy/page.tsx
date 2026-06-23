'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Privacy() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-white/60">
              Last updated: January 2026
            </p>
          </div>

          {/* Intro */}
          <p className="mb-8 text-center text-sm text-white/50">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Information We Collect</h2>
              <p className="text-sm leading-relaxed text-white/50">
                To fulfill your order, you must provide certain information such as your name,
                email address, postal address, payment information, and the details of the product
                you're ordering. You may also choose to provide additional personal information
                when you contact us directly.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">How We Use Your Information</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• To fulfill your order and provide customer support</li>
                <li>• To send order confirmations and shipping updates</li>
                <li>• To improve our services and user experience</li>
                <li>• To comply with legal obligations such as tax law</li>
                <li>• With your consent, to send marketing communications</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Information Sharing</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We share your personal information only for limited reasons: with service providers
                who help us operate our business (payment processors, shipping carriers), to comply
                with laws, or to protect our rights. We never sell your personal information to
                third parties.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Data Retention</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We retain your personal information only for as long as necessary to provide you
                with our services and as required by law. Generally, we keep order data for five
                years to comply with tax and legal obligations.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Your Rights</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• Access and receive a copy of your personal data</li>
                <li>• Request correction of inaccurate information</li>
                <li>• Request deletion of your personal data</li>
                <li>• Opt-out of marketing communications at any time</li>
                <li>• Withdraw consent where applicable</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Security</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. All payment
                information is processed through secure, encrypted connections.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Third-Party Services</h2>
              <p className="text-sm leading-relaxed text-white/50">
                This policy does not apply to third-party services we link to or integrate with.
                We encourage you to review the privacy policies of any third-party services you
                use through our website.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Questions about privacy?
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
