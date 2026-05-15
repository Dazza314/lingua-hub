import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Database } from '../src/database.types'

const SEEDS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'seeds',
  'jlpt',
)
const LANGUAGE = 'ja'

const LEVELS = [
  {
    id: '2492a856-9ea0-4020-80ad-94cf162690c3',
    file: 'N5.txt',
    title: 'JLPT N5',
  },
  {
    id: '74bc49f8-b8a4-4cde-8639-2879a2fe5525',
    file: 'N4.txt',
    title: 'JLPT N4',
  },
  {
    id: '85b487f8-8aa7-4e6d-93de-7c1861b2af99',
    file: 'N3.txt',
    title: 'JLPT N3',
  },
  {
    id: '67790f1c-39e1-4916-93b5-e845f7b06bca',
    file: 'N2.txt',
    title: 'JLPT N2',
  },
  {
    id: '6cfbea7a-a7b3-45f7-a1af-c65dc68db895',
    file: 'N1.txt',
    title: 'JLPT N1',
  },
]

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
}

const client = createClient<Database>(supabaseUrl, supabaseKey)

for (const { id, file, title } of LEVELS) {
  const terms = readFileSync(join(SEEDS_DIR, file), 'utf8')
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)

  const { data: vocabRows, error: vocabError } = await client
    .from('curated_vocab_items')
    .upsert(
      terms.map((term) => ({ language: LANGUAGE, term })),
      { onConflict: 'language,term' },
    )
    .select('id')
  if (vocabError) {
    throw vocabError
  }

  const { error: setError } = await client
    .from('sets')
    .upsert({ id, language: LANGUAGE, title }, { onConflict: 'id' })
  if (setError) {
    throw setError
  }

  const { error: linkError } = await client.from('set_vocab_items').upsert(
    vocabRows.map((r) => ({ set_id: id, vocab_item_id: r.id })),
    { onConflict: 'set_id,vocab_item_id' },
  )
  if (linkError) {
    throw linkError
  }

  console.log(`${title}: ${terms.length} terms`)
}
