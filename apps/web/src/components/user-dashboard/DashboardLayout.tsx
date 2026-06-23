'use client';
import { useState } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faShoppingBag,
  faCog,
  faHeart,
  faSignOutAlt,
  faBars,
  faTimes,
  faDashboard,
  faGift,
  faGavel,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import DashboardOverview from './DashboardOverview';
import UserProfile from './UserProfile';
import UserOrders from './UserOrders';
import UserWishlist from './UserWishlist';
import UserSettings from './UserSettings';
import UserReferrals from './UserReferrals';
import UserBids from './UserBids';
import UserAddresses from './UserAddresses';

type DashboardSection = 'overview' | 'profile' | 'orders' | 'bids' | 'wishlist' | 'addresses' | 'referrals' | 'settings';

export default function DashboardLayout() {
  const { user, signOut } = useBetterAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'overview' as DashboardSection, label: 'Overview', icon: faDashboard },
    { id: 'profile' as DashboardSection, label: 'Profile', icon: faUser },
    { id: 'orders' as DashboardSection, label: 'Orders', icon: faShoppingBag },
    { id: 'bids' as DashboardSection, label: 'My Bids', icon: faGavel },
    { id: 'wishlist' as DashboardSection, label: 'Wishlist', icon: faHeart },
    { id: 'addresses' as DashboardSection, label: 'Addresses', icon: faMapMarkerAlt },
    { id: 'referrals' as DashboardSection, label: 'Referrals', icon: faGift },
    { id: 'settings' as DashboardSection, label: 'Settings', icon: faCog },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'profile':
        return <UserProfile />;
      case 'orders':
        return <UserOrders />;
      case 'bids':
        return <UserBids />;
      case 'wishlist':
        return <UserWishlist />;
      case 'addresses':
        return <UserAddresses />;
      case 'referrals':
        return <UserReferrals />;
      case 'settings':
        return <UserSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="bg-white p-4 shadow-sm lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="h-6 w-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed z-30 h-screen w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
        >
          <div className="p-6">
            <div className="mb-8 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <FontAwesomeIcon icon={faUser} className="text-lg text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Welcome back!</h2>
                <p className="truncate text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeSection === item.id
                      ? 'border-r-2 border-purple-700 bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="absolute right-6 bottom-6 left-6">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-20 bg-black lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6 lg:p-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
