import { makeParse } from '@lingua-hub/core'
import { CuratedSetId } from '@lingua-hub/vocab'
import { z } from 'zod'

export const vocabSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('selected_sets') }),
  z.object({
    type: z.literal('specific_sets'),
    setIds: z.array(CuratedSetId.curatedSetIdSchema),
  }),
  z.object({ type: z.literal('imported_vocab') }),
])

export const grammarSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('selected_sets') }),
  z.object({
    type: z.literal('specific_sets'),
    setIds: z.array(CuratedSetId.curatedSetIdSchema),
  }),
])

export const exercisePolicySchema = z.object({
  vocab: z.array(vocabSourceSchema),
  grammar: z.array(grammarSourceSchema),
})

export type VocabSource = z.infer<typeof vocabSourceSchema>
export type GrammarSource = z.infer<typeof grammarSourceSchema>
export type ExercisePolicy = z.infer<typeof exercisePolicySchema>

export const parse = makeParse(exercisePolicySchema)

export const dangerouslyCast = (
  value: z.input<typeof exercisePolicySchema>,
): ExercisePolicy => value as ExercisePolicy
