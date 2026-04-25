import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.linguahub.app',
  appName: 'Lingua Hub',
  webDir: '../web/.next/static',
  server: {
    // During development, point at the Next.js dev server
    // Comment this out for production builds
    url: 'http://localhost:3000',
    cleartext: true,
  },
}

export default config
