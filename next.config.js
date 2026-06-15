/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Cho phép mammoth chạy phía server để đọc file Word
  experimental: {
    serverComponentsExternalPackages: ['mammoth'],
  },
}
module.exports = nextConfig
