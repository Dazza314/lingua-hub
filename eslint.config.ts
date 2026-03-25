import type { Linter } from 'eslint'
import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config: Linter.Config[] = [
  // Next.js rules — only for the web app
  ...[...nextConfig, ...nextTypescript].map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx}'],
  })),
]

export default config
