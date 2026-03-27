import { z } from 'zod'
import { makeParse } from '../../utils/makeParse'

const PermissionStatusSchema = z
  .object({
    granted: z
      .boolean()
      .describe(
        "True if the app has been granted access to AnkiDroid's ContentProvider",
      ),
    ankiDroidInstalled: z
      .boolean()
      .describe('True if AnkiDroid is installed on the device'),
  })
  .describe('Permission check/request result from AnkiDroid bridge')

export const PermissionStatusResponseSchema = PermissionStatusSchema
export type PermissionStatusResponse = z.infer<
  typeof PermissionStatusResponseSchema
>
export const parse = makeParse(PermissionStatusResponseSchema)
