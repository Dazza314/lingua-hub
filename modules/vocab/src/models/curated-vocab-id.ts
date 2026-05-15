import { z } from 'zod'

export const curatedVocabIdSchema = z.uuid().brand('CuratedVocabId')
export type CuratedVocabId = z.infer<typeof curatedVocabIdSchema>
