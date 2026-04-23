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
  { ignores: ['**/*.d.ts', 'supabase/src/database.types.ts'] },
  // Strict TypeScript rules for all TS files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.strict, ...tseslint.configs.stylistic],
    rules: {
      curly: ['error', 'all'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
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
      'supabase/src/index.ts',
      'modules/*/src/{models,schemas}/index.ts',
    ],
    plugins: { 'no-barrel-files': noBarrelFiles },
    rules: {
      'no-barrel-files/no-barrel-files': 'error',
    },
  },
  // File and directory naming conventions — modules
  {
    files: ['modules/**/*.{ts,tsx}', 'supabase/**/*.{ts,tsx}'],
    ignores: ['**/index.{ts,tsx}', '**/*.config.ts', '**/*.test.{ts,tsx}'],
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
  // File and directory naming conventions — Next.js web app
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    ignores: [
      '**/index.{ts,tsx}',
      '**/*.config.ts',
      '**/*.test.{ts,tsx}',
      // Next.js reserved filenames (framework-enforced, lowercase)
      '**/page.tsx',
      '**/layout.tsx',
      '**/loading.tsx',
      '**/error.tsx',
      '**/not-found.tsx',
      '**/template.tsx',
      '**/default.tsx',
      '**/global-error.tsx',
      '**/route.ts',
      '**/middleware.ts',
      // shadcn/ui generated components (kebab-case by convention)
      'apps/web/components/ui/**',
    ],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'apps/web/**/*.tsx': 'PASCAL_CASE',
          'apps/web/**/*.ts': 'KEBAB_CASE',
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { 'apps/web/**/': 'NEXT_JS_APP_ROUTER_CASE' },
      ],
    },
  },
)
