/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'tzlaxvggnulilxrhqfel.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.com'
      }
    ]
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
};

module.exports = nextConfig; 