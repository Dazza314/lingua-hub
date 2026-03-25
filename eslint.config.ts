import { includeIgnoreFile } from '@eslint/compat'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import { resolve } from 'node:path'

const gitignorePath = resolve(import.meta.dirname, '.gitignore')

const config = [
  includeIgnoreFile(gitignorePath),
  { ignores: ['**/*.d.ts'] },
  // TypeScript parser + plugin registry for all TS files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
  },
  // Next.js rules — only for the web app
  ...[...nextConfig, ...nextTypescript].map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx}'],
  })),
  // Enforce extensionless imports across all TS source
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/*.js', '**/*.jsx'], message: 'Use extensionless imports' }] },
      ],
    },
  },
]

export default config
