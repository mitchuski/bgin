/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cloudflare Pages: standalone output; disable image optimization (not supported on edge)
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
