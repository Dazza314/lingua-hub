import { z } from 'zod'

export const importedVocabIdSchema = z.uuid().brand('ImportedVocabId')
export type ImportedVocabId = z.infer<typeof importedVocabIdSchema>
