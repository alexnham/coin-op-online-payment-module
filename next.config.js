/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return []
  },
  trailingSlash: false,
}

module.exports = nextConfig