import { makeParse } from '@lingua-hub/core'
import { CuratedSetId } from '@lingua-hub/vocab'
import { z } from 'zod'

export const vocabSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('selectedSets') }),
  z.object({
    type: z.literal('specificSets'),
    setIds: z.array(CuratedSetId.curatedSetIdSchema).min(1),
  }),
])

export const vocabPolicySchema = z.object({
  source: vocabSourceSchema,
  importedVocab: z.boolean(),
})

export const grammarSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('selectedSets') }),
  z.object({
    type: z.literal('specificSets'),
    setIds: z.array(CuratedSetId.curatedSetIdSchema).min(1),
  }),
])

export const grammarPolicySchema = z.object({
  source: grammarSourceSchema,
})

export const exercisePolicySchema = z.object({
  vocab: vocabPolicySchema,
  grammar: grammarPolicySchema,
})

export type VocabSource = z.infer<typeof vocabSourceSchema>
export type VocabPolicy = z.infer<typeof vocabPolicySchema>
export type GrammarSource = z.infer<typeof grammarSourceSchema>
export type GrammarPolicy = z.infer<typeof grammarPolicySchema>
export type ExercisePolicy = z.infer<typeof exercisePolicySchema>

export const parse = makeParse(exercisePolicySchema)

export const dangerouslyCast = (
  value: z.input<typeof exercisePolicySchema>,
): ExercisePolicy => value as ExercisePolicy
