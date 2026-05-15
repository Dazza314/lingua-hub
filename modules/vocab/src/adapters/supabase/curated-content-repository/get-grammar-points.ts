import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedGrammarPoint from '../../../models/curated-grammar-point'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createGetCuratedGrammarPoints(
  client: SupabaseClient<Database>,
): CuratedContentRepository['getCuratedGrammarPoints'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('curated_grammar_points')
      .select('id, language, title, explanation')
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated grammar points', {
        cause: error,
      })
    }

    return (data ?? []).map((row) =>
      CuratedGrammarPoint.dangerouslyCast({
        id: row.id,
        language: row.language,
        title: row.title,
        explanation: row.explanation,
      }),
    )
  }
}
