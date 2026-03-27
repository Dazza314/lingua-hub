import { z } from 'zod'

export const vocabIdSchema = z.uuid().brand('VocabId')
export type VocabId = z.infer<typeof vocabIdSchema>
