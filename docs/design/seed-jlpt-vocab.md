# Seed JLPT vocab

One-off idempotent script that populates `curated_vocab_items`, `sets`, and `set_vocab_items` for JLPT N5–N1.

## Open: source the vocab files

Need N5–N1 word lists as plain text files (one term per line). Proposed location once sourced:

```
supabase/seeds/jlpt/N5.txt
supabase/seeds/jlpt/N4.txt
supabase/seeds/jlpt/N3.txt
supabase/seeds/jlpt/N2.txt
supabase/seeds/jlpt/N1.txt
```

## Idempotency strategy

- **Vocab items** — upsert on `(language, term)`. The unique constraint already exists.
- **Sets** — hardcoded UUIDs, upsert on `(id)`. Keeps `title` as a pure display field with no identity role. On conflict, the upsert updates `language` and `title` to the same values — harmless.
- **Junction rows** — upsert on the composite PK `(set_id, vocab_item_id)`.

## Script

`supabase/scripts/seed-jlpt.ts` — TypeScript, run directly with Node. Uses the Supabase JS client.

Generate the five set UUIDs when implementing and commit them here.

```ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Database } from '../src/database.types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEEDS_DIR = join(__dirname, '..', 'seeds', 'jlpt')
const LANGUAGE = 'ja'

const LEVELS = [
  { id: '<uuid-n5>', file: 'N5.txt', title: 'JLPT N5' },
  { id: '<uuid-n4>', file: 'N4.txt', title: 'JLPT N4' },
  { id: '<uuid-n3>', file: 'N3.txt', title: 'JLPT N3' },
  { id: '<uuid-n2>', file: 'N2.txt', title: 'JLPT N2' },
  { id: '<uuid-n1>', file: 'N1.txt', title: 'JLPT N1' },
]

const client = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

for (const { id, file, title } of LEVELS) {
  const terms = readFileSync(join(SEEDS_DIR, file), 'utf8')
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)

  // Upsert vocab items, get back their IDs
  const { data: vocabRows, error: vocabError } = await client
    .from('curated_vocab_items')
    .upsert(
      terms.map((term) => ({
        id: crypto.randomUUID(),
        language: LANGUAGE,
        term,
      })),
      { onConflict: 'language,term' },
    )
    .select('id')
  if (vocabError) {
    throw vocabError
  }

  // Upsert set by hardcoded UUID
  const { error: setError } = await client
    .from('sets')
    .upsert({ id, language: LANGUAGE, title }, { onConflict: 'id' })
  if (setError) {
    throw setError
  }

  // Link vocab items to the set
  const { error: linkError } = await client.from('set_vocab_items').upsert(
    vocabRows!.map((r) => ({ set_id: id, vocab_item_id: r.id })),
    { onConflict: 'set_id,vocab_item_id' },
  )
  if (linkError) {
    throw linkError
  }

  console.log(`${title}: ${terms.length} terms`)
}
```

## pnpm script

```json
"seed:jlpt": "node --experimental-strip-types supabase/scripts/seed-jlpt.ts"
```

## Running

```sh
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:jlpt
```

Use the service role key (not the anon key) — RLS blocks inserts for the anon role. Keys are in the Supabase dashboard under Project Settings → API.

## Verify

```sql
SELECT s.title, COUNT(*) AS term_count
FROM sets s
JOIN set_vocab_items sv ON sv.set_id = s.id
WHERE s.language = 'ja'
GROUP BY s.title
ORDER BY s.title;
```
