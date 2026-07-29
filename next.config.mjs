/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the development client to hydrate when the app is opened from
  // another device on the local network.
  allowedDevOrigins: ['192.168.1.117'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
