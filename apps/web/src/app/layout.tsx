import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import ClientLayout from './ClientLayout';
import { getSEOMetadataFromDB } from '@/lib/utils/seoMetadata';

config.autoAddCss = false;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const bacasime = localFont({
  src: '../../public/fonts/BacasimeAntique-Regular.ttf',
  variable: '--font-bacasime',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

// Dynamic metadata from database
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOMetadataFromDB();
  const baseUrl = seo.siteUrl;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.seoTitle,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.seoDescription,
    keywords: seo.seoKeywords.split(',').map(k => k.trim()),
    authors: [{ name: seo.seoAuthor }],
    creator: seo.seoAuthor,
    publisher: seo.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/logos/gem.png',
      apple: '/logos/gem.png',
    },
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      url: baseUrl,
      siteName: seo.siteName,
      title: seo.openGraphTitle || seo.seoTitle,
      description: seo.openGraphDescription || seo.seoDescription,
      images: [
        {
          url: seo.openGraphImage || '/logos/gems-logo.png',
          width: 1200,
          height: 630,
          alt: `${seo.siteName} - Authentic Gemstones`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.seoTitle,
      description: seo.twitterDescription || seo.seoDescription,
      images: [seo.twitterImage || seo.openGraphImage || '/logos/gems-logo.png'],
    },
    manifest: '/manifest.webmanifest',
    category: 'ecommerce',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for organization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gemsutopia',
    description: 'Authentically sourced gemstones from Alberta, Canada',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com'}/logos/gems-logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com'}/contact`,
    },
  };

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Gemsutopia',
    description: 'Premium gemstone collection from Alberta, Canada',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gemsutopia.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
      addressRegion: 'AB',
    },
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${bacasime.variable} ${inter.variable} ${cormorant.variable} bg-black antialiased`}
      >
        <div id="scroll-wrapper">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
