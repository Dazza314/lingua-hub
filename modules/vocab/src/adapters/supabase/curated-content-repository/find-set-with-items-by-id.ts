import type { Database } from '@lingua-hub/supabase'
import { Result } from '@praha/byethrow'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CuratedSetNotFoundError } from '../../../errors'
import * as CuratedSetWithItems from '../../../models/curated-set-with-items'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSetWithItemsById(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSetWithItemsById'] {
  return async ({ id }) => {
    const { data, error } = await client
      .from('sets')
      .select(
        'id, language, title, set_vocab_items(curated_vocab_items(id, language, term)), set_grammar_points(curated_grammar_points(id, language, title, explanation))',
      )
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error('Failed to fetch curated set', { cause: error })
    }

    if (!data) {
      return Result.fail(new CuratedSetNotFoundError(`Set not found: ${id}`))
    }

    return Result.succeed(
      CuratedSetWithItems.dangerouslyCast({
        id: data.id,
        language: data.language,
        title: data.title,
        vocabItems: data.set_vocab_items.flatMap((j) =>
          j.curated_vocab_items ? [j.curated_vocab_items] : [],
        ),
        grammarPoints: data.set_grammar_points.flatMap((j) =>
          j.curated_grammar_points ? [j.curated_grammar_points] : [],
        ),
      }),
    )
  }
}
