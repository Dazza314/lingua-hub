import { z } from 'zod'

export const vocabFieldTargetSchema = z.enum(['term', 'definition', 'reading'])
export type VocabFieldTarget = z.infer<typeof vocabFieldTargetSchema>
