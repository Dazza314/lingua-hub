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

type Level = 'N5' | 'N4' | 'N3'

const LEVELS: { level: Level; id: string; title: string }[] = [
  {
    level: 'N5',
    id: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
    title: 'JLPT N5 Grammar',
  },
  {
    level: 'N4',
    id: '2b3c4d5e-6f7a-8b9c-0d1e-f2a3b4c5d6e7',
    title: 'JLPT N4 Grammar',
  },
  {
    level: 'N3',
    id: '3c4d5e6f-7a8b-9c0d-1e2f-a3b4c5d6e7f8',
    title: 'JLPT N3 Grammar',
  },
]

type Entry = { level: Level; grammar_point: string; example_jp: string }

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
}

const client = createClient<Database>(supabaseUrl, supabaseKey)

const allEntries: Entry[] = JSON.parse(
  readFileSync(join(SEEDS_DIR, 'grammar.json'), 'utf8'),
)

for (const { level, id, title } of LEVELS) {
  const entries = allEntries.filter((e) => e.level === level)

  const { data: grammarRows, error: grammarError } = await client
    .from('curated_grammar_points')
    .upsert(
      entries.map((e) => ({
        language: LANGUAGE,
        title: e.grammar_point,
        explanation: e.example_jp,
      })),
      { onConflict: 'language,title' },
    )
    .select('id')
  if (grammarError) {
    throw grammarError
  }

  const { error: setError } = await client
    .from('sets')
    .upsert({ id, language: LANGUAGE, title }, { onConflict: 'id' })
  if (setError) {
    throw setError
  }

  const { error: linkError } = await client.from('set_grammar_points').upsert(
    grammarRows.map((r) => ({ set_id: id, grammar_point_id: r.id })),
    { onConflict: 'set_id,grammar_point_id' },
  )
  if (linkError) {
    throw linkError
  }

  console.log(`${title}: ${entries.length} grammar points`)
}
