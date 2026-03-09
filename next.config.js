/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // xlsx uses some Node.js built-ins; tell webpack to ignore them in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      buffer: false,
    };
    return config;
  },
};

module.exports = nextConfig;
