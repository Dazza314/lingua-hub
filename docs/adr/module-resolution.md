# Module Resolution Strategy

Internal workspace modules (`modules/*`) point their `package.json` entrypoints directly at TypeScript source files rather than compiled output:

```json
{
  "main": "src/index.ts",
  "module": "src/index.ts",
  "types": "src/index.ts"
}
```

## Why no build step for modules

The two consuming apps have different needs:

- **`apps/web`** (Next.js) — the bundler transpiles all TypeScript itself, including workspace dependencies. There is no reason to pre-compile modules separately.
- **`apps/mobile`** (Capacitor) — a thin native wrapper that loads the web app's bundle. The compiled output it needs comes from the Next.js build, not from the modules directly.

Since every consumer is ultimately a bundler or delegates to one, pre-compiling modules to `dist/` adds complexity with no benefit: an extra build step, stale output to manage, and a `dependsOn: ["^build"]` chain in Turbo that slows down `typecheck`.

## TypeScript configuration

`noEmit: true` and `allowImportingTsExtensions: true` are set in the root `tsconfig.json` and inherited by all packages — no per-package overrides needed. `moduleResolution: "Bundler"` is used throughout since all consumers go through a bundler, not Node.js directly.

Imports use no file extension:

```ts
import { AnkiDroidClient } from './AnkiDroidClient'
```

The `.js` extension convention (common in Node.js ESM projects) is unnecessary here because bundlers handle extension resolution themselves.

## Trade-offs accepted

- `tsc` is a type-checker only across the whole monorepo — no package uses it to emit output.
- Any future consumer that is not a bundler (e.g. a plain Node.js CLI or script) would need additional transpilation setup.
- If a module were ever published to npm, a proper build step would need to be reintroduced for that package.
