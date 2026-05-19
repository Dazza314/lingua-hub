import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedVocabItem from '../../../models/curated-vocab-item'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindVocabItemsBySetId(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findVocabItemsBySetId'] {
  return async ({ id, page, pageSize }) => {
    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    const { data, count, error } = await client
      .from('set_vocab_items')
      .select('curated_vocab_items(id, language, term)', { count: 'exact' })
      .eq('set_id', id)
      .order('vocab_item_id')
      .range(from, to)

    if (error) {
      throw new Error('Failed to fetch vocab items for set', { cause: error })
    }

    return {
      items: data.map((row) =>
        CuratedVocabItem.dangerouslyCast(row.curated_vocab_items),
      ),
      totalCount: count ?? 0,
    }
  }
}
