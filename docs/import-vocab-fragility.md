# Vocab import — fragility improvements

Design notes for hardening the AnkiDroid → Supabase vocab import on Android. Scope is reliability of the sync itself; UI/recovery flow is out of scope here.

## Current behaviour

`importVocab` (`modules/vocab/src/commands/import-vocab.ts`) is two long-running steps in series:

1. **Fetch all notes** for the chosen model in a single Capacitor bridge call (`get-vocab-items.ts:21` → `client.getNotesWithCards({ modelId })`).
2. **Upsert all rows** in a single Supabase call (`upsert-vocab-items.ts:18` → `.upsert(rows, { onConflict: 'id' })`).

Failure modes today:

- **Whole-deck fetch** holds every note in JS heap and in one bridge payload. WebView suspension or a large deck can wipe it out.
- **Whole-batch upsert** can fail wholesale on a network blip or hit PostgREST size limits. Partial server-side application is possible but invisible to the client.
- **Fail-fast on `InvalidLayoutError`** — `get-vocab-items.ts:55` aborts on the first malformed note; all prior fetch work is wasted.
- **No progress** — UI shows "Importing…" for the whole duration regardless of size.
- **No retry** — any transient failure surfaces as `sync-error`.

The bridge schema already supports pagination (`limit`, `offset`, `hasMore`, `totalCount` in `notes-page-response.ts`); the adapter just doesn't use it. VocabIds are `uuidv5(note.guid, ANKI_VOCAB_ID_NAMESPACE)`, so re-imports are idempotent at the DB layer.

## Options

### A. Stream pages through to upsert _(load-bearing)_

Replace fetch-all-then-upsert-all with a page-by-page loop:

```
loop:
  page = fetch(limit=500, offset=N)
  items = map(page)
  upsert(items)
  emit progress { done: N + items.length, total: page.totalCount }
  if !page.hasMore: break
```

Gains:

- **Bounded memory** — never hold the whole deck at once.
- **Idempotent resume for free** — UUIDv5 + `onConflict: 'id'` makes a re-run from offset 0 cheap; completed pages are no-op upserts.
- **Real progress UI** (`done / total`).
- **Smaller blast radius** — a network blip kills one page, not the whole import.

Shape change: `importVocab` needs a way to emit progress. Cleanest is an optional `onProgress` callback in `ImportVocabDeps`; async iterators are nicer in theory but harder to thread through the `Result.ResultAsync` types.

Tradeoff: more bridge round-trips → slightly higher wall-clock on the happy path. Acceptable.

### B. Don't fail-fast on `InvalidLayoutError`

Two parts:

1. **Validate the layout up front** — before fetching, check that every `mapping.sourceField` exists in `layout.fields`. Catches "user mapped a field name that no longer exists on the model" immediately, no bridge calls wasted. Essentially free.
2. **Skip + report bad notes** — instead of aborting the whole import, collect bad notes into `{ imported: N, skipped: [{ guid, reason }] }`. UI shows "imported 4,987, skipped 13" with a details disclosure.

Do (1) now. Defer (2) until we see real data-quality issues — the schema-validated case is the only one we've actually hit.

### C. Retry transient failures per page

Wrap each page's `getNotesWithCards` and each `upsert` in a small retry-with-backoff (e.g. 3 attempts at 500ms / 2s / 8s, only on network-shaped errors). Combined with idempotency, a flaky connection becomes invisible instead of a `sync-error` screen.

Scope retries to the page, not the whole import — otherwise a deterministic failure (bad data, auth) gets retried pointlessly.

### D. Persist progress for true resume

Store last completed offset + layout/mapping in Capacitor Preferences. On `sync-error`, offer "Resume" using the saved offset.

Probably **not needed** if A+C land — page-by-page retry from offset 0 is fast because completed pages are no-op upserts. Revisit only if real-world decks make the no-op pass meaningfully slow.

## Recommended

Hold **B(2)** and **D** until failure data justifies them.
