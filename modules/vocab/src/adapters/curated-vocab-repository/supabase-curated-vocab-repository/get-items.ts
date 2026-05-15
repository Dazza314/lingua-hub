import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedVocabItem from '../../../models/curated-vocab-item'
import type { CuratedVocabRepository } from '../../../ports/curated-vocab-repository'

export function createGetCuratedVocabItems(
  client: SupabaseClient<Database>,
): CuratedVocabRepository['getCuratedVocabItems'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('curated_vocab_items')
      .select('id, language, term')
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated vocab items', { cause: error })
    }

    return (data ?? []).map((row) =>
      CuratedVocabItem.dangerouslyCast({
        id: row.id,
        language: row.language,
        term: row.term,
      }),
    )
  }
}
