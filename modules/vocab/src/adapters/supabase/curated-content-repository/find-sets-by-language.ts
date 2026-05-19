import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedSet from '../../../models/curated-set'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSetsByLanguage(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSetsByLanguage'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('sets')
      .select(
        'id, language, title, category, set_vocab_items(count), set_grammar_points(count)',
      )
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated sets', { cause: error })
    }

    return data.map((row) =>
      CuratedSet.dangerouslyCast({
        id: row.id,
        language: row.language,
        title: row.title,
        category: row.category,
        vocabCount: row.set_vocab_items[0]?.count ?? 0,
        grammarCount: row.set_grammar_points[0]?.count ?? 0,
      }),
    )
  }
}
