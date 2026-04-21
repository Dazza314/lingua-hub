import type { Database } from '@lingua-hub/supabase'
import { Result } from '@praha/byethrow'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UnexpectedVocabRepositoryError } from '../../../errors'
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

    if (error) {
      return Result.fail(
        new UnexpectedVocabRepositoryError('Failed to fetch vocab items', { cause: error }),
      )
    }

    return Result.pipe(
      Result.sequence(data ?? [], (row) =>
        VocabItem.parse({
          id: row.id,
          language: row.language,
          term: row.term,
          definition: row.definition,
          reading: row.reading ?? undefined,
        }),
      ),
      Result.mapError(
        (err) => new UnexpectedVocabRepositoryError('Failed to parse vocab items', { cause: err }),
      ),
    )
  }
}
