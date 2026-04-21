import { z } from 'zod'
import { makeParse } from '../utils/make-parse'

// BCP 47 language tag, e.g. "ja", "es", "fr-FR"
export const languageSchema = z.string().min(2).brand('Language')
export type Language = z.infer<typeof languageSchema>
export const parse = makeParse(languageSchema)
