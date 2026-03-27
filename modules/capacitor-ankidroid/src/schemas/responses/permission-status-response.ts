import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'

const permissionStatusSchema = z
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

export const permissionStatusResponseSchema = permissionStatusSchema
export type PermissionStatusResponse = z.infer<
  typeof permissionStatusResponseSchema
>
export const parse = makeParse(permissionStatusResponseSchema)
