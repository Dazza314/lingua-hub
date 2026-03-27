import { z } from 'zod'
import { userIdSchema } from './user-id'

export const userSchema = z.object({
  id: userIdSchema,
  email: z.email(),
  displayName: z.string(),
})

export type User = z.infer<typeof userSchema>
