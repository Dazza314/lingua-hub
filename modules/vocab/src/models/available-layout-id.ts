import { z } from 'zod'

export const availableLayoutIdSchema = z.string().brand('AvailableLayoutId')
export type AvailableLayoutId = z.infer<typeof availableLayoutIdSchema>
