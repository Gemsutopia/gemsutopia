'use client';

import {
  faBars,
  faDashboard,
  faHeart,
  faMapMarkerAlt,
  faShoppingBag,
  faSignOutAlt,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import DashboardOverview from './DashboardOverview';
import UserAddresses from './UserAddresses';
import UserOrders from './UserOrders';
import UserProfile from './UserProfile';
import UserWishlist from './UserWishlist';

type DashboardSection = 'overview' | 'profile' | 'orders' | 'wishlist' | 'addresses';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: faDashboard },
  { id: 'orders', label: 'Orders', icon: faShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: faHeart },
  { id: 'addresses', label: 'Addresses', icon: faMapMarkerAlt },
  { id: 'profile', label: 'Profile', icon: faUser },
] satisfies Array<{ id: DashboardSection; label: string; icon: typeof faUser }>;

const validSections = new Set<DashboardSection>(menuItems.map((item) => item.id));

export default function DashboardLayout() {
  const { user, signOut } = useBetterAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const requestedSection = searchParams.get('section') as DashboardSection | null;
  const activeSection =
    requestedSection && validSections.has(requestedSection) ? requestedSection : 'overview';

  const activeLabel = useMemo(
    () => menuItems.find((item) => item.id === activeSection)?.label ?? 'Overview',
    [activeSection]
  );

  const selectSection = (section: DashboardSection) => {
    const params = new URLSearchParams(searchParams.toString());
    if (section === 'overview') params.delete('section');
    else params.set('section', section);
    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false });
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile />;
      case 'orders':
        return <UserOrders />;
      case 'wishlist':
        return <UserWishlist />;
      case 'addresses':
        return <UserAddresses />;
      default:
        return <DashboardOverview onNavigate={selectSection} />;
    }
  };

  return (
    <div className="customer-dashboard min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] pt-20 sm:pt-24">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[min(19rem,88vw)] border-r border-white/10 bg-[#080808] px-5 pb-6 pt-24 transition-transform duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:w-72 lg:translate-x-0 lg:pt-8 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Customer account navigation"
        >
          <div className="mb-8 border-b border-white/10 pb-6">
            <p className="text-xs tracking-[0.18em] text-white/35 uppercase">Your account</p>
            <p className="mt-3 truncate font-[family-name:var(--font-bacasime)] text-2xl text-white">
              {user?.name || 'Gem collector'}
            </p>
            <p className="mt-1 truncate text-xs text-white/45">{user?.email}</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSection(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  activeSection === item.id
                    ? 'bg-white text-black'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-8 flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-white/45 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 lg:absolute lg:bottom-8 lg:left-5 lg:right-5 lg:w-[calc(100%-2.5rem)]"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close account navigation"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 px-4 pb-20 sm:px-8 lg:px-12 xl:px-16">
          <div className="sticky top-20 z-30 -mx-4 flex items-center justify-between border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-8">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase lg:hidden">
                Account
              </p>
              <h1 className="font-[family-name:var(--font-bacasime)] text-2xl lg:text-4xl">
                {activeLabel}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 lg:hidden"
              aria-label={sidebarOpen ? 'Close account navigation' : 'Open account navigation'}
              aria-expanded={sidebarOpen}
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="h-4 w-4" />
            </button>
          </div>

          <div className="dashboard-content py-6 lg:py-2">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
