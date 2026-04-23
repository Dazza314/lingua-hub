# Lingua Hub — Claude instructions

## Module structure

Each module under `modules/` exposes a single public entry point at `src/index.ts`. Consumers import only from there, never from internal paths.

## Barrel file rules

Barrel files (files that only re-export from other files) are forbidden by ESLint (`no-barrel-files/no-barrel-files`), with two exceptions:

1. **Package entry points** — `modules/*/src/index.ts` and `apps/*/src/index.ts`. These define the public API of each package.
2. **Schema/model aggregators** — `modules/*/src/{schemas,models}/index.ts`. These group related schemas or domain models into namespaces for convenient internal use.

Schema/model aggregators must use **namespace re-exports** (`export * as Foo from '...'`), not flat re-exports (`export * from '...'`). This keeps the origin of each export explicit at the call site (e.g. `DecksResponse.parse`, `NoteQuery.NoteQuery`).

## Error handling

`Result<T, E>` (byethrow) is for **expected, recoverable failures** — errors a caller can meaningfully act on (e.g. `EmptyVocabError`, `VocabItemNotFoundError`). If an error is in `Result`, it is something the caller is expected to handle.

**Unexpected failures throw.** Infrastructure errors (DB down, network failure) and system consistency violations (data that fails schema assumptions) are not recoverable by callers — they propagate to the nearest error boundary (`error.tsx`). Do not wrap them in `Result`.
