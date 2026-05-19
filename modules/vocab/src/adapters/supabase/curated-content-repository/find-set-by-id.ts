import type { Database } from '@lingua-hub/supabase'
import { Result } from '@praha/byethrow'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CuratedSetNotFoundError } from '../../../errors'
import * as CuratedSet from '../../../models/curated-set'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSetById(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSetById'] {
  return async ({ id }) => {
    const { data, error } = await client
      .from('sets_with_counts')
      .select('id, language, title, category, vocab_count, grammar_count')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error('Failed to fetch set', { cause: error })
    }

    if (!data || !data.id || !data.language || !data.title || !data.category) {
      return Result.fail(new CuratedSetNotFoundError(`Set not found: ${id}`))
    }

    return Result.succeed(
      CuratedSet.dangerouslyCast({
        id: data.id,
        language: data.language,
        title: data.title,
        category: data.category,
        vocabCount: data.vocab_count ?? 0,
        grammarCount: data.grammar_count ?? 0,
      }),
    )
  }
}
