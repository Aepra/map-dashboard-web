/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Disable Next.js dev tools in development
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Disable dev overlay
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
