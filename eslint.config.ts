import { includeIgnoreFile } from '@eslint/compat'
import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import { resolve } from 'node:path'
import tseslint from 'typescript-eslint'

const gitignorePath = resolve(import.meta.dirname, '.gitignore')

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  { ignores: ['**/*.d.ts'] },
  // Strict TypeScript rules for all TS files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.strict, ...tseslint.configs.stylistic],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
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
)
