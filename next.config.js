/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js dev tools in development
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Disable dev overlay
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
