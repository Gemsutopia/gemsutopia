'use client';
import {
  IconStar,
  IconX,
  IconShoppingBag,
  IconBuildingStore,
  IconInfoCircle,
  IconMail,
  IconHelpCircle,
  IconGavel,
  IconShare,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import '../../styles/dropdown.css';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Dropdown({ isOpen, onClose }: DropdownProps) {
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useBetterAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const dropdownContent = (
    <div
      className="dropdown-overlay fixed inset-0 transform bg-black/50 backdrop-blur-lg transition-all duration-300 ease-in-out md:hidden"
      onClick={onClose}
    >
      <div className="relative flex h-full flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="absolute top-0 right-0 left-0 z-10 overflow-hidden bg-black py-3">
          <div className="flex justify-center whitespace-nowrap">
            <p className="bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text px-8 text-lg font-bold text-transparent">
              GEMSUTOPIA
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 pt-12">
          <div className="mb-8 flex items-center justify-between">
            <Image
              src="/logos/gem.png"
              alt="Gem"
              width={32}
              height={32}
              className="h-6 w-auto object-contain"
            />
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <IconX className="h-8 w-8" />
            </button>
          </div>

          <nav className="flex-1 space-y-6 pl-2">
            <a
              href="/gem-pouch"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconShoppingBag size={20} />
              Gem Pouch
            </a>

            <a
              href="/wishlist"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconStar className="h-5 w-5" />
              Wishlist
            </a>

            <a
              href="/shop"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconBuildingStore size={20} />
              Shop
            </a>

            <a
              href="/auctions"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconGavel size={20} />
              Auctions
            </a>

            <a
              href="/about"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconInfoCircle size={20} />
              About
            </a>
            <a
              href="/contact-us"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconMail size={20} />
              Contact
            </a>
            <a
              href="/social"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconShare size={20} />
              Socials
            </a>
            <a
              href="/support"
              className="flex items-center gap-3 text-lg font-semibold text-white hover:text-gray-300"
              onClick={onClose}
            >
              <IconHelpCircle size={20} />
              Support
            </a>
          </nav>
          <div className="space-y-4 pb-8">
            {user ? (
              <div className="space-y-3">
                <div className="text-center text-sm text-white">
                  Hi, {user.name || user.email?.split('@')[0]}!
                </div>
                <button
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="block w-full rounded-full border border-white bg-transparent px-10 py-3 text-center font-semibold text-white transition-all hover:bg-white hover:text-black"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/sign-up"
                className="block w-full rounded-full bg-white px-10 py-3 text-center font-semibold text-black transition-all hover:bg-gray-200"
                onClick={onClose}
              >
                Sign Up
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(dropdownContent, document.body);
}
