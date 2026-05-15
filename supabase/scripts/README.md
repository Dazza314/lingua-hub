# Supabase seed scripts

One-off scripts that populate the database with curated content. All scripts are idempotent — safe to re-run.

## seed-jlpt.ts

Populates `curated_vocab_items`, `sets`, and `set_vocab_items` for JLPT N5–N1 (8,505 terms total).

Add these to the root `.env` file (both are in the Supabase dashboard under **Project Settings → Data API**):

```sh
SUPABASE_URL=        # Project URL at the top of the page
SUPABASE_SERVICE_ROLE_KEY=  # service_role key under "Project API keys" (not anon — RLS blocks inserts)
```

Then from the **repo root**:

```sh
pnpm seed:jlpt
```
