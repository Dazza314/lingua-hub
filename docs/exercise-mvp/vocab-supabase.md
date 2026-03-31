# vocab-supabase

Supabase adapter for the existing `VocabRepository` port in `modules/vocab`.

## Adapter

**`createSupabaseVocabRepository(supabaseClient)`** — factory function that takes a Supabase client and returns a `VocabRepository`. This keeps the adapter decoupled from how the client is created.

Methods to implement:

- `getItems(userId)` — query vocab items for a user (needed for exercise generation)
- `saveItems(userId, items)` — insert/upsert vocab items
- `deleteItems(userId, ids)` — delete by IDs

All three are required by the port interface. `getItems` is the one the exercise feature actually uses.

## Supabase table

Needs a `vocab_items` table (or similar) with columns for the `VocabItem` fields + `user_id`. Schema TBD — will need a Supabase migration.

## Location

`modules/vocab/src/adapters/vocab-repository/supabase-vocab-repository.ts` — lives inside the vocab module alongside the existing `AnkiDroidAdapter`.

## Depends on

Nothing — implements an existing port.
