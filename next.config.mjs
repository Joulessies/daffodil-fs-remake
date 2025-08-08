/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  // Disable static optimization for pages that use useSearchParams
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
