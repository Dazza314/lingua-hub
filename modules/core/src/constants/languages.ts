import { languageSchema } from '../models/language'

export const Languages = {
  French: languageSchema.parse('fr'),
  German: languageSchema.parse('de'),
  Japanese: languageSchema.parse('ja'),
  Mandarin: languageSchema.parse('zh'),
  Spanish: languageSchema.parse('es'),
} as const
