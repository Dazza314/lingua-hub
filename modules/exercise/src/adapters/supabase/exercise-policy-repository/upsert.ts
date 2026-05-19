import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ExercisePolicyRepository } from '../../../ports/exercise-policy-repository'

export function createUpsert(
  client: SupabaseClient<Database>,
): ExercisePolicyRepository['upsert'] {
  return async ({ userId, language, policy }) => {
    const { error } = await client.from('user_exercise_policy').upsert(
      {
        user_id: userId,
        language,
        vocab_set_ids: policy.vocab.setIds,
        grammar_set_ids: policy.grammar.setIds,
        imported_vocab: policy.vocab.importedVocab,
      },
      { onConflict: 'user_id,language' },
    )

    if (error) {
      throw new Error('Failed to upsert exercise policy', { cause: error })
    }
  }
}
