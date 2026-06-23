'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IconMenu2, IconX, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faXTwitter,
  faFacebook,
  faYoutube,
  faTiktok,
  faPatreon,
} from '@fortawesome/free-brands-svg-icons';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/contexts/CurrencyContext';

const shopLinks = [
  { label: 'All Gems', href: '/shop' },
  { label: 'Featured', href: '/shop/featured' },
  { label: 'Auctions', href: '/auctions' },
];

const defaultSocials: Record<string, string> = {
  instagram: 'https://www.instagram.com/shop.gemsutopia/',
  tiktok: 'https://www.tiktok.com/@gemsutopia.shop',
  youtube: 'https://www.youtube.com/channel/UC9FUB2IsVVbZly_ZGwOD2aQ',
  twitter: 'https://x.com/gemsutopia_shop',
  facebook_business: 'https://www.facebook.com/gemsutopia',
  facebook_personal: '',
  patreon: 'https://www.patreon.com/cw/Gemsutopia',
  gemrockauctions: 'https://www.gemrockauctions.com/stores/gemsutopia',
};

const socialConfig = [
  { key: 'instagram', name: 'Instagram', icon: faInstagram },
  { key: 'tiktok', name: 'TikTok', icon: faTiktok },
  { key: 'youtube', name: 'YouTube', icon: faYoutube },
  { key: 'twitter', name: 'X', icon: faXTwitter },
  { key: 'facebook_business', name: 'Facebook (Business)', icon: faFacebook },
  { key: 'facebook_personal', name: 'Facebook (Personal)', icon: faFacebook },
  { key: 'patreon', name: 'Patreon', icon: faPatreon },
  { key: 'gemrockauctions', name: 'Gem Rock Auctions', icon: faGem },
];

export default function Header() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bagHovered, setBagHovered] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(defaultSocials);

  // Fetch socials from DB
  useEffect(() => {
    fetch('/api/pages/socials')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.content && Object.keys(data.data.content).length > 0) {
          setSocialLinks(prev => ({ ...prev, ...data.data.content }));
        }
      })
      .catch(() => {});
  }, []);

  const socials = socialConfig
    .filter(s => socialLinks[s.key])
    .map(s => ({ name: s.name, href: socialLinks[s.key], icon: s.icon }));

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setShopExpanded(false);
  };

  const handleShopClick = () => {
    setShopExpanded(!shopExpanded);
  };

  return (
    <>
      <header className="fixed top-2 right-2 left-2 z-[100] rounded-2xl border border-white/10 bg-black/40 text-white backdrop-blur-xl xs:top-2.5 xs:right-4 xs:left-4 sm:top-3 sm:right-6 sm:left-6 sm:rounded-3xl md:top-4 md:right-12 md:left-12 lg:right-24 lg:left-24 xl:right-32 xl:left-32 3xl:right-40 3xl:left-40">
        <div className="flex h-14 items-center px-2.5 xs:h-16 xs:px-3 sm:h-[72px] sm:px-4 md:h-16 md:px-6">
          {/* Logo - Left */}
          <Link href="/" className="ml-0.5 flex h-full items-center overflow-hidden xs:ml-1 sm:ml-2 [-webkit-tap-highlight-color:transparent]">
            <Image
              src="/logos/lgoo.svg"
              alt="Gemsutopia"
              width={36}
              height={36}
              className="h-40 w-40 object-contain xs:h-44 xs:w-44 md:h-48 md:w-48 lg:h-52 lg:w-52"
            />
          </Link>

          {/* Mobile - Sign Up + Hamburger */}
          <div className="absolute right-2.5 flex items-center gap-1.5 xs:right-3 xs:gap-2 sm:right-4 sm:gap-3 md:hidden">
            {!mobileMenuOpen ? (
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="h-8 rounded-md border-transparent bg-white/10 px-4 text-xs text-white hover:bg-white hover:text-black xs:h-9 xs:px-5 xs:text-sm sm:h-10 sm:rounded-lg sm:px-6"
                >
                  Sign Up
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrency(currency === 'USD' ? 'CAD' : 'USD')}
                className="h-8 rounded-md border-transparent bg-white/10 px-4 text-xs text-white hover:bg-white hover:text-black xs:h-9 xs:px-5 xs:text-sm sm:h-10 sm:rounded-lg sm:px-6"
              >
                <span className={`fi ${currency === 'USD' ? 'fi-us' : 'fi-ca'} mr-1.5`} /> {currency}
              </Button>
            )}
            <button
              className="text-white/80 transition-colors hover:text-white"
              onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
            >
              {mobileMenuOpen ? <IconX size={22} className="xs:h-6 xs:w-6" /> : <IconMenu2 size={22} className="xs:h-6 xs:w-6" />}
            </button>
          </div>

          {/* Navigation - Center (Desktop) */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-6 md:flex lg:gap-8">
            <div
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
              className="relative"
            >
              <Link
                href="/shop"
                className="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                Shop
                <IconChevronDown size={14} />
              </Link>
              <AnimatePresence>
                {shopDropdownOpen && (
                  <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="min-w-[160px] rounded-xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl">
                      {shopLinks.map((link, index) => (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Link
                            href={link.href}
                            className="block rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/about"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Contact
            </Link>
            <div
              onMouseEnter={() => setSocialsOpen(true)}
              onMouseLeave={() => setSocialsOpen(false)}
            >
              <span className="cursor-pointer text-sm font-medium text-white/80 transition-colors hover:text-white">
                Socials
              </span>
              <AnimatePresence>
                {socialsOpen && (
                  <motion.div
                    className="absolute top-full right-0 left-0 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center justify-center gap-3 py-3">
                      {socials.map((social, index) => (
                        <motion.a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 hover:bg-white/10"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <FontAwesomeIcon
                            icon={social.icon}
                            className="text-base text-white/70 transition-colors group-hover:text-white"
                          />
                          <span className="whitespace-nowrap text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                            {social.name}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Sign Up - Right (Desktop) */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button
              variant="outline"
              className="h-9 rounded-md border-transparent bg-white/10 px-3 text-sm text-white hover:bg-white hover:text-black sm:h-10 sm:rounded-lg"
              onClick={() => setCurrency(currency === 'USD' ? 'CAD' : 'USD')}
            >
              <span className={`fi ${currency === 'USD' ? 'fi-us' : 'fi-ca'}`} />
            </Button>
            <Link href="/gem-pouch">
              <Button
                variant="outline"
                className="h-9 rounded-md border-transparent bg-white/10 px-3 text-white hover:bg-white hover:text-black sm:h-10 sm:rounded-lg"
                onMouseEnter={() => setBagHovered(true)}
                onMouseLeave={() => setBagHovered(false)}
              >
                <Image
                  src={bagHovered ? '/icons/bag-b.svg' : '/icons/bag.svg'}
                  alt="Bag"
                  width={14}
                  height={14}
                />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                variant="outline"
                className="h-9 rounded-md border-transparent bg-white/10 px-5 text-sm text-white hover:bg-white hover:text-black sm:h-10 sm:rounded-lg sm:px-6"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu - Full page overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setShopExpanded(false);
            }}
          >
            <div className="flex h-full flex-col px-2">
              {/* Nav links - pushed to bottom */}
              <nav className="mt-auto mb-6 flex flex-col gap-3">
                {/* Shop Accordion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopClick();
                    }}
                    className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/[0.03] bg-white/5 px-6 text-left text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>Shop</span>
                    <IconChevronDown size={20} className="text-white/60" />
                  </button>
                  <AnimatePresence>
                    {shopExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 pt-2 pl-4">
                          {shopLinks.map((link, index) => (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                href={link.href}
                                className="flex h-10 w-full items-center rounded-xl px-4 text-base text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                                onClick={closeMobileMenu}
                              >
                                {link.label}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link
                    href="/gem-pouch"
                    className="flex h-12 w-full items-center rounded-2xl border border-white/[0.03] bg-white/5 px-6 text-left text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Gem Pouch
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/wishlist"
                    className="flex h-12 w-full items-center rounded-2xl border border-white/[0.03] bg-white/5 px-6 text-left text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Wishlist
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link
                    href="/about"
                    className="flex h-12 w-full items-center rounded-2xl border border-white/[0.03] bg-white/5 px-6 text-left text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/contact-us"
                    className="flex h-12 w-full items-center rounded-2xl border border-white/[0.03] bg-white/5 px-6 text-left text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Contact
                  </Link>
                </motion.div>
              </nav>

              {/* Sign Up & Log In buttons */}
              <motion.div
                className="mb-6 flex gap-3 px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Link href="/sign-in" className="flex-1" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-transparent bg-white/10 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up" className="flex-1" onClick={closeMobileMenu}>
                  <Button className="h-12 w-full rounded-2xl bg-white font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>

              {/* Socials - under buttons */}
              <div className="mb-8 flex justify-center gap-5">
                {socials.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 transition-colors hover:text-white"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-xl" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
