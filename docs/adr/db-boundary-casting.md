# DB Boundary Casting

When mapping rows from our own Supabase database to domain models, adapters use `dangerouslyCast` rather than `parse`.

## Decision

Supabase adapters cast DB rows to domain models with `dangerouslyCast` instead of running the Zod schema via `parse`. For example:

```ts
return CuratedSet.dangerouslyCast({
  id: row.id,
  language: row.language,
  title: row.title,
})
```

## Why not `parse`

The DB schema enforces the shape of our own data. If a row doesn't match the domain model, it is a deployment or migration error — not a runtime condition the application can recover from. Running the Zod schema on every read adds overhead without providing a meaningful recovery path: the failure mode is indistinguishable from any other system consistency violation, and would propagate to the error boundary either way.

`dangerouslyCast` signals the intent: we assert the shape is correct because we own the schema that guarantees it.

## Boundary

This applies only to data from our own Supabase database. Data from external systems (e.g. AnkiDroid, user-supplied input, third-party APIs) must be validated with `parse` at the adapter boundary, per the error-handling ADR.

## Trade-offs accepted

- A migration that introduces a new enum value (e.g. a new `language`) will cause a silent domain model violation until the application code is updated to recognise it, rather than a thrown error. Keeping migrations and application code in sync is already required — this is not an additional burden.
- `dangerouslyCast` is not type-safe: TypeScript accepts the call as long as the input matches `z.input<typeof schema>`, but does not verify the output at runtime. This is intentional — the DB schema is the source of truth, not the Zod schema.
