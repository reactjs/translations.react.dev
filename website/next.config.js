/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  output: 'export',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
