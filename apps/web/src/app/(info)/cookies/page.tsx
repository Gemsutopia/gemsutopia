'use client';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function Cookies() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="relative min-h-screen grow overflow-hidden px-4 py-24 sm:px-8 md:px-16 lg:px-32">
        <div className="relative z-10 mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-4xl text-white">
              Cookie Policy
            </h1>
            <p className="text-sm text-white/60">Last updated: January 2026</p>
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
                They enable basic features like shopping cart functionality, checkout process, and
                remembering your preferences.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Analytics Cookies</h2>
              <p className="text-sm leading-relaxed text-white/50">
                We use analytics cookies to understand how visitors interact with our website. This
                helps us improve our website performance and user experience. All information
                collected is anonymous and aggregated.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Marketing Cookies</h2>
              <p className="text-sm leading-relaxed text-white/50">
                These cookies track your browsing activity to help us show you relevant
                advertisements. They may be set by us or third-party advertising partners. You can
                opt out of marketing cookies without affecting core website functionality.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Third-Party Cookies</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• QuickEngine storefront analytics (only with your permission)</li>
                <li>• Payment processors when you choose to check out</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Managing Cookies</h2>
              <ul className="space-y-1.5 text-sm leading-relaxed text-white/50">
                <li>• Browser Settings: Most browsers let you control cookies through settings</li>
                <li>• Cookie choices: Reopen the consent banner from the footer</li>
                <li>• Reject: Continue with only storage required to operate the shop</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <h2 className="mb-2 text-sm font-medium text-white">Your Consent</h2>
              <p className="text-sm leading-relaxed text-white/50">
                Optional analytics are used only after you accept them. You can change your choice
                at any time using the Cookie choices button in the footer.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10">
            <p className="mb-3 text-center text-xs text-white/40">Questions about cookies?</p>
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
