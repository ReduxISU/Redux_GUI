/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// next.config.js
module.exports = {
  // ... rest of the configuration.
  experimental: {
    outputStandalone: true,
  },
}