import { z } from 'zod'

export const tagIdSchema = z.uuid().brand('TagId')
export type TagId = z.infer<typeof tagIdSchema>
