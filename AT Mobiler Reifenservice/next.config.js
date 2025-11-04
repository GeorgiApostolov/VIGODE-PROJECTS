/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.pexels.com', 'i.imgur.com'],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
