import { networkInterfaces } from 'node:os'

const localNetworkAddresses = [
  ...new Set(
    Object.values(networkInterfaces())
      .flat()
      .filter((network) => network?.family === 'IPv4' && !network.internal)
      .map((network) => network.address),
  ),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A LAN IP can change whenever Wi-Fi/hotspot changes. Discover the current
  // addresses so Next's development assets can hydrate on other devices.
  allowedDevOrigins: localNetworkAddresses,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
