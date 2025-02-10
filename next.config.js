/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'tzlaxvggnulilxrhqfel.supabase.co',
      'flagcdn.com'
    ],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
};

module.exports = nextConfig; 