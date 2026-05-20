import { withSerwist } from '@serwist/turbopack'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default withSerwist(nextConfig)
