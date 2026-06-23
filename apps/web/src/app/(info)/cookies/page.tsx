'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Cookies() {
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
              Cookie Policy
            </h1>
            <p className="text-sm text-white/60">
              Last updated: January 2026
            </p>
          </div>

          {/* Intro */}
          <p className="mb-8 text-center text-sm text-white/50">
            Learn how we use cookies to improve your browsing experience.
          </p>

          {/* Sections */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">What Are Cookies?</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Cookies are small text files that are stored on your device when you visit our
                website. They help us provide you with a better browsing experience and allow
                certain features to function properly.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Essential Cookies</h2>
              <p className="text-sm leading-relaxed text-white/50">
                These cookies are necessary for the website to function and cannot be switched off.
                They enable basic features like shopping cart functionality, checkout process,
                and remembering your preferences.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Analytics Cookies</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We use analytics cookies to understand how visitors interact with our website.
                This helps us improve our website performance and user experience. All information
                collected is anonymous and aggregated.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Marketing Cookies</h2>
              <p className="text-sm leading-relaxed text-white/50">
                These cookies track your browsing activity to help us show you relevant
                advertisements. They may be set by us or third-party advertising partners.
                You can opt out of marketing cookies without affecting core website functionality.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Third-Party Cookies</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• Google Analytics (for website analytics)</li>
                <li>• Payment processors (for secure transactions)</li>
                <li>• Social media platforms (for social sharing features)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Managing Cookies</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• Browser Settings: Most browsers let you control cookies through settings</li>
                <li>• Cookie Settings: Use our Cookie Settings page to manage preferences</li>
                <li>• Opt-Out: You can opt out of certain cookies, though this may affect functionality</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Your Consent</h2>
              <p className="text-sm leading-relaxed text-white/50">
                By continuing to use our website, you consent to our use of cookies as described
                in this policy. You can withdraw your consent at any time by adjusting your
                cookie settings or browser preferences.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">
              Questions about cookies?
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
