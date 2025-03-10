
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js to work with our Vite-built app
  reactStrictMode: true,
  swcMinify: true,
  // Redirect all requests to our Vite app
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
