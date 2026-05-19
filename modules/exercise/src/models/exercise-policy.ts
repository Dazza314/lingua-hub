import { makeParse } from '@lingua-hub/core'
import { CuratedSetId } from '@lingua-hub/vocab'
import { z } from 'zod'

const setIdsSchema = z
  .array(CuratedSetId.curatedSetIdSchema)
  .transform((ids) => [...new Set(ids)])

export const vocabPolicySchema = z.object({
  setIds: setIdsSchema,
  importedVocab: z.boolean(),
})

export const grammarPolicySchema = z.object({
  setIds: setIdsSchema,
})

export const exercisePolicySchema = z.object({
  vocab: vocabPolicySchema,
  grammar: grammarPolicySchema,
})

export type VocabPolicy = z.infer<typeof vocabPolicySchema>
export type GrammarPolicy = z.infer<typeof grammarPolicySchema>
export type ExercisePolicy = z.infer<typeof exercisePolicySchema>

export const DEFAULT_EXERCISE_POLICY: ExercisePolicy = {
  vocab: { setIds: [], importedVocab: false },
  grammar: { setIds: [] },
}

export const parse = makeParse(exercisePolicySchema)

export const dangerouslyCast = (
  value: z.input<typeof exercisePolicySchema>,
): ExercisePolicy => value as ExercisePolicy
