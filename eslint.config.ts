import { includeIgnoreFile } from '@eslint/compat'
import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import checkFile from 'eslint-plugin-check-file'
import noBarrelFiles from 'eslint-plugin-no-barrel-files'
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
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
      ],
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
        {
          patterns: [
            {
              group: ['**/*.js', '**/*.jsx'],
              message: 'Use extensionless imports',
            },
          ],
        },
      ],
    },
  },
  // No barrel files (package entry points are exempt)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'modules/*/src/index.ts',
      'apps/*/src/index.ts',
      'modules/*/src/{models,schemas}/index.ts',
    ],
    plugins: { 'no-barrel-files': noBarrelFiles },
    rules: {
      'no-barrel-files/no-barrel-files': 'error',
    },
  },
  // File and directory naming conventions
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/index.{ts,tsx}', '**/*.config.ts'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'KEBAB_CASE' },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { '**/**/': 'KEBAB_CASE' },
      ],
    },
  },
)
