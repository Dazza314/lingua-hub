import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as VocabItem from '../../../models/vocab-item'
import type { VocabRepository } from '../../../ports/vocab-repository'

export function createGetVocabItems(
  client: SupabaseClient<Database>,
): VocabRepository['getVocabItems'] {
  return async ({ userId, language }) => {
    const { data, error } = await client
      .from('vocab_items')
      .select('id, language, term, definition, reading')
      .eq('user_id', userId)
      .eq('language', language)

    if (error) throw new Error('Failed to fetch vocab items', { cause: error })

    return (data ?? []).map((row) =>
      VocabItem.dangerouslyCast({
        id: row.id,
        language: row.language,
        term: row.term,
        definition: row.definition,
        reading: row.reading ?? undefined,
      }),
    )
  }
}
