import type { Database } from '@lingua-hub/supabase'
import { Result } from '@praha/byethrow'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ImportedVocabItemNotFoundError } from '../../../errors'
import type { VocabRepository } from '../../../ports/vocab-repository'

export function createDeleteImportedVocabItems(
  client: SupabaseClient<Database>,
): VocabRepository['deleteImportedVocabItems'] {
  return async (userId, ids) => {
    const { data, error } = await client
      .from('imported_vocab_items')
      .delete()
      .eq('user_id', userId)
      .in('id', ids)
      .select('id')

    if (error) {
      throw new Error('Failed to delete vocab items', { cause: error })
    }

    const deletedIds = new Set(
      (data ?? []).map((row: { id: string }) => row.id),
    )
    const missing = ids.filter((id) => !deletedIds.has(id))

    if (missing.length > 0) {
      return Result.fail(
        new ImportedVocabItemNotFoundError(
          `Vocab items not found: ${missing.join(', ')}`,
        ),
      )
    }

    return Result.succeed()
  }
}
