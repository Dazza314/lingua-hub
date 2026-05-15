import { z } from 'zod'

export const curatedSetIdSchema = z.uuid().brand('CuratedSetId')
export type CuratedSetId = z.infer<typeof curatedSetIdSchema>
