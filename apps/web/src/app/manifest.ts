import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gemsutopia - Authentic Gemstones',
    short_name: 'Gemsutopia',
    description:
      'Authentically sourced gemstones from Alberta, Canada. Premium quality hand-mined gems.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logos/gem.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/gem.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'lifestyle'],
    lang: 'en',
    dir: 'ltr',
  };
}
