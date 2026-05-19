import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedSet from '../../../models/curated-set'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSetsByLanguage(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSetsByLanguage'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('sets_with_counts')
      .select('id, language, title, category, vocab_count, grammar_count')
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated sets', { cause: error })
    }

    return data.flatMap((row) => {
      if (!row.id || !row.language || !row.title || !row.category) {
        return []
      }
      return CuratedSet.dangerouslyCast({
        id: row.id,
        language: row.language,
        title: row.title,
        category: row.category,
        vocabCount: row.vocab_count ?? 0,
        grammarCount: row.grammar_count ?? 0,
      })
    })
  }
}
