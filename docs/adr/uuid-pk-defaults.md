# ADR — UUID primary keys default to gen_random_uuid()

## Status

Accepted

## Context

All tables defined `id uuid primary key` without a default. This requires every insert to supply an explicit ID. When using Supabase's upsert with `onConflict`, all provided columns are written on conflict — including `id`. If the caller generates a fresh UUID on each upsert attempt, Postgres tries to overwrite the existing `id`, which violates any foreign key referencing it.

## Decision

All UUID primary key columns have `default gen_random_uuid()`. New rows that don't supply an `id` get one from Postgres automatically. Callers that do supply one (e.g. seeding with stable hardcoded UUIDs) continue to work.

## Consequences

- Upserts that omit `id` from the payload are safe: Postgres generates an ID for new rows and leaves existing rows untouched on conflict.
- Application code and seed scripts are not required to generate IDs — the responsibility sits at the DB boundary where it belongs.
- Existing migrations are unchanged; the defaults were applied retroactively in `20260515000004_add_pk_id_defaults.sql`.
