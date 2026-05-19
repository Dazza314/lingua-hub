import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedVocabItem from '../../../models/curated-vocab-item'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createGetCuratedVocabItems(
  client: SupabaseClient<Database>,
): CuratedContentRepository['getCuratedVocabItems'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('curated_vocab_items')
      .select('id, language, term')
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated vocab items', { cause: error })
    }

    return data.map((row) =>
      CuratedVocabItem.dangerouslyCast({
        id: row.id,
        language: row.language,
        term: row.term,
      }),
    )
  }
}
