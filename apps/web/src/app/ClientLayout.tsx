'use client';
import { GemPouchProvider } from '../contexts/GemPouchContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { CookieProvider } from '../contexts/CookieContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { BetterAuthProvider } from '../contexts/BetterAuthContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { ModeProvider } from '../lib/contexts/ModeContext';
import CookieBanner from '../components/layout/CookieBanner';
import MaintenanceOverlay from '../components/layout/MaintenanceOverlay';
import SandboxBanner from '../components/layout/SandboxBanner';
import DynamicMetadata from '../components/seo/DynamicMetadata';
import DynamicTitle from '../components/seo/DynamicTitle';
import SoldOutItemsMonitor from '../components/feedback/SoldOutItemsMonitor';
import ReferralTracker from '../components/tracking/ReferralTracker';
import AnalyticsTracker from '../components/tracking/AnalyticsTracker';
import { Toaster } from '../components/ui/sonner';
import ScrollToTop from '../components/utils/ScrollToTop';
import FloatingWishlistButton from '../components/layout/FloatingWishlistButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <CookieProvider>
        <BetterAuthProvider>
          <CurrencyProvider>
            <InventoryProvider>
              <WishlistProvider>
                <GemPouchProvider>
                  <ScrollToTop />
                  <DynamicMetadata />
                  <DynamicTitle />
                  <SoldOutItemsMonitor />
                  <ReferralTracker />
                  <AnalyticsTracker />
                  <SandboxBanner />
                  {children}
                  <CookieBanner />
                  <MaintenanceOverlay />
                  <FloatingWishlistButton />
                  <Toaster position="bottom-right" />
                </GemPouchProvider>
              </WishlistProvider>
            </InventoryProvider>
          </CurrencyProvider>
        </BetterAuthProvider>
      </CookieProvider>
    </ModeProvider>
  );
}
