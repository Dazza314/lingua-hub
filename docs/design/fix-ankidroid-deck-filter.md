# Fix: AnkiDroid deck filter silently dropped during vocab import

## Problem

When importing vocab, notes from decks other than the selected one are returned. This causes `InvalidLayoutError` when a note from a different deck has a different note type whose fields don't match the expected layout mappings.

## Root cause

`getNotesWithCards` in `AnkiDroidPlugin.kt` builds an Anki search query via `buildNoteSearchQuery`. To filter by deck, it calls `fetchDeckName(deckId)`, which queries `content://$AUTHORITY/decks/$deckId` — a per-ID URI path that AnkiDroid's ContentProvider may not support. If the cursor comes back `null`, `fetchDeckName` returns `null`. Back in `buildNoteSearchQuery`, a `null` return silently skips adding the `deck:"..."` term to the search. The notes query then runs with no deck constraint and returns all notes across all decks.

The same pattern exists in `fetchModelName`, which queries `content://$AUTHORITY/models/$modelId`.

## Fix

### 1. Replace per-ID URI lookups with full-list scans

`fetchDeckName` should query `DECKS_URI` (the same URI used by `getDecks`, which works correctly) and scan the result for the matching ID. Same fix for `fetchModelName` using `MODELS_URI`.

### 2. Reject the call if resolution fails

If a deck or model ID cannot be resolved to a name even after the full-list scan, `getNotesWithCards` must call `call.reject(...)` rather than silently drop the filter. Returning unfiltered results when a required constraint can't be applied is always wrong.

## Scope

All changes are in `AnkiDroidPlugin.kt`. No TypeScript or schema changes required.
