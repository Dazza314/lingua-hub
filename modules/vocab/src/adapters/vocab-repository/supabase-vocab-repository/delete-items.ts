import { Result } from '@praha/byethrow'
import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  UnexpectedVocabRepositoryError,
  VocabItemNotFoundError,
} from '../../../errors'
import type { VocabRepository } from '../../../ports/vocab-repository'

export function createDeleteVocabItems(
  client: SupabaseClient<Database>,
): VocabRepository['deleteVocabItems'] {
  return async (userId, ids) => {
    const { data, error } = await client
      .from('vocab_items')
      .delete()
      .eq('user_id', userId)
      .in('id', ids)
      .select('id')

    if (error) {
      return Result.fail(
        new UnexpectedVocabRepositoryError('Failed to delete vocab items', { cause: error }),
      )
    }

    const deletedIds = new Set(
      (data ?? []).map((row: { id: string }) => row.id),
    )
    const missing = ids.filter((id) => !deletedIds.has(id))

    if (missing.length > 0) {
      return Result.fail(
        new VocabItemNotFoundError(`Vocab items not found: ${missing.join(', ')}`),
      )
    }

    return Result.succeed()
  }
}
