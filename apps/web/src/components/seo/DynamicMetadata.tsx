'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface SEOMetadata {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

interface DynamicMetadataProps {
  pageTitle?: string;
  pageDescription?: string;
  canonical?: string;
}

export default function DynamicMetadata({
  pageTitle,
  pageDescription,
  canonical,
}: DynamicMetadataProps) {
  const [metadata, setMetadata] = useState<SEOMetadata>({
    seoTitle: 'Gemsutopia - Premium Gemstone Collection',
    seoDescription:
      "Hi, I'm Reese, founder of Gemsutopia and proud Canadian gem dealer from Alberta. Every gemstone is hand-selected, ethically sourced, and personally...",
    seoKeywords: 'gemstones, minerals, natural stones, precious gems',
    seoAuthor: 'Gemsutopia',
    openGraphTitle: '',
    openGraphDescription: '',
    openGraphImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/seo-metadata');
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch {
        // Keep default metadata
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    // Note: Document title is handled by DynamicTitle component using General Settings
    const title = pageTitle ? `${pageTitle} - ${metadata.seoTitle}` : metadata.seoTitle;

    // Update meta description
    const description = pageDescription || metadata.seoDescription;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = description;
      document.head.appendChild(newMetaDescription);
    }

    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.seoKeywords);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', metadata.seoKeywords);
      document.head.appendChild(metaKeywords);
    }

    // Update author
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor) {
      metaAuthor.setAttribute('content', metadata.seoAuthor);
    } else {
      metaAuthor = document.createElement('meta');
      metaAuthor.setAttribute('name', 'author');
      metaAuthor.setAttribute('content', metadata.seoAuthor);
      document.head.appendChild(metaAuthor);
    }

    // Update Open Graph tags
    const ogTitle = metadata.openGraphTitle || title;
    const ogDescription = metadata.openGraphDescription || description;

    updateOrCreateMeta('property', 'og:title', ogTitle);
    updateOrCreateMeta('property', 'og:description', ogDescription);
    updateOrCreateMeta('property', 'og:type', 'website');
    updateOrCreateMeta('property', 'og:url', window.location.href);

    if (metadata.openGraphImage) {
      updateOrCreateMeta('property', 'og:image', metadata.openGraphImage);
    }

    // Update Twitter Card tags
    const twitterTitle = metadata.twitterTitle || title;
    const twitterDescription = metadata.twitterDescription || description;

    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', twitterTitle);
    updateOrCreateMeta('name', 'twitter:description', twitterDescription);

    if (metadata.twitterImage) {
      updateOrCreateMeta('name', 'twitter:image', metadata.twitterImage);
    }

    // Update canonical URL if provided
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonical);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonical);
        document.head.appendChild(canonicalLink);
      }
    }
  }, [metadata, pageTitle, pageDescription, canonical]);

  const updateOrCreateMeta = (attr: string, value: string, content: string) => {
    let meta = document.querySelector(`meta[${attr}="${value}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute(attr, value);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  };

  return null; // This component doesn't render anything
}
