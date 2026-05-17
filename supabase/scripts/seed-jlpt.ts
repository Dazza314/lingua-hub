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
    id: '2492a856-9ea0-4020-80ad-94cf162690c3',
    title: 'JLPT N5',
  },
  {
    level: 'N4',
    id: '74bc49f8-b8a4-4cde-8639-2879a2fe5525',
    title: 'JLPT N4',
  },
  {
    level: 'N3',
    id: '85b487f8-8aa7-4e6d-93de-7c1861b2af99',
    title: 'JLPT N3',
  },
]

type GrammarEntry = { level: Level; grammar_point: string; example_jp: string }

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
}

const client = createClient<Database>(supabaseUrl, supabaseKey)

const allGrammarEntries: GrammarEntry[] = JSON.parse(
  readFileSync(join(SEEDS_DIR, 'grammar.json'), 'utf8'),
)

for (const { level, id, title } of LEVELS) {
  const { error: setError } = await client
    .from('sets')
    .upsert({ id, language: LANGUAGE, title }, { onConflict: 'id' })
  if (setError) {
    throw setError
  }

  const terms = readFileSync(join(SEEDS_DIR, `${level}.txt`), 'utf8')
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

  const { error: vocabLinkError } = await client.from('set_vocab_items').upsert(
    vocabRows.map((r) => ({ set_id: id, vocab_item_id: r.id })),
    { onConflict: 'set_id,vocab_item_id' },
  )
  if (vocabLinkError) {
    throw vocabLinkError
  }

  const grammarEntries = allGrammarEntries.filter((e) => e.level === level)

  if (grammarEntries.length > 0) {
    const { data: grammarRows, error: grammarError } = await client
      .from('curated_grammar_points')
      .upsert(
        grammarEntries.map((e) => ({
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

    const { error: grammarLinkError } = await client
      .from('set_grammar_points')
      .upsert(
        grammarRows.map((r) => ({ set_id: id, grammar_point_id: r.id })),
        { onConflict: 'set_id,grammar_point_id' },
      )
    if (grammarLinkError) {
      throw grammarLinkError
    }
  }

  console.log(
    `${title}: ${terms.length} vocab, ${grammarEntries.length} grammar points`,
  )
}
