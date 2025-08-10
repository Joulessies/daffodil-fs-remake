/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Use Next.js server runtime to allow API routes (needed for AI generation)
  output: "standalone",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
