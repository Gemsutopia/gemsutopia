'use client';

import { useMediaQuery } from 'react-responsive';
import { isMobile, isTablet, isDesktop, isBrowser, isMobileOnly } from 'react-device-detect';

export function useDevice() {
  // Media query based detection (SSR safe with fallback)
  const isSmallScreen = useMediaQuery({ maxWidth: 479 });
  const isMediumScreen = useMediaQuery({ minWidth: 480, maxWidth: 767 });
  const isLargeScreen = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isExtraLargeScreen = useMediaQuery({ minWidth: 1024 });

  // Tailwind breakpoints (matches globals.css)
  const isXs = useMediaQuery({ minWidth: 480 }); // large phones
  const isSm = useMediaQuery({ minWidth: 640 }); // small tablets
  const isMd = useMediaQuery({ minWidth: 768 }); // tablets
  const isLg = useMediaQuery({ minWidth: 1024 }); // small laptops
  const isXl = useMediaQuery({ minWidth: 1280 }); // laptops
  const is2xl = useMediaQuery({ minWidth: 1536 }); // large laptops
  const is3xl = useMediaQuery({ minWidth: 1920 }); // desktop monitors

  return {
    // Device type (from react-device-detect)
    isMobile,
    isTablet,
    isDesktop,
    isBrowser,
    isMobileOnly,

    // Screen size based (legacy)
    isSmallScreen, // < 480px (small phones)
    isMediumScreen, // 480-767px (large phones)
    isLargeScreen, // 768-1023px (tablets)
    isExtraLargeScreen, // >= 1024px (laptops+)

    // Tailwind breakpoints
    isXs, // >= 480px (large phones)
    isSm, // >= 640px (small tablets)
    isMd, // >= 768px (tablets)
    isLg, // >= 1024px (small laptops)
    isXl, // >= 1280px (laptops)
    is2xl, // >= 1536px (large laptops)
    is3xl, // >= 1920px (desktop monitors)

    // Convenience helpers
    isMobileView: !isXs || isMobile,
    isTabletView: (isMd && !isLg) || isTablet,
    isDesktopView: isLg || isDesktop,
  };
}

export default useDevice;
