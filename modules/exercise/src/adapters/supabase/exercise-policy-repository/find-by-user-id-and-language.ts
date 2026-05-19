import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ExercisePolicy } from '../../../models/index'
import type { ExercisePolicyRepository } from '../../../ports/exercise-policy-repository'

export function createFindByUserIdAndLanguage(
  client: SupabaseClient<Database>,
): ExercisePolicyRepository['findByUserIdAndLanguage'] {
  return async ({ userId, language }) => {
    const { data: row, error } = await client
      .from('user_exercise_policy')
      .select('*')
      .eq('user_id', userId)
      .eq('language', language)
      .maybeSingle()

    if (error) {
      throw new Error('Failed to fetch exercise policy', { cause: error })
    }

    if (!row) {
      return ExercisePolicy.DEFAULT_EXERCISE_POLICY
    }

    const policy = ExercisePolicy.dangerouslyCast({
      vocab: {
        setIds: row.vocab_set_ids,
        importedVocab: row.imported_vocab,
      },
      grammar: {
        setIds: row.grammar_set_ids,
      },
    })

    return policy
  }
}
