import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use this package as the root for output file tracing (avoids parent lockfile warning)
  outputFileTracingRoot: __dirname,
  // Cloudflare Pages: standalone output; disable image optimization (not supported on edge)
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
