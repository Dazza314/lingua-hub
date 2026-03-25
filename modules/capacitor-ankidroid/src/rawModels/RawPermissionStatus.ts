import { z } from 'zod'

export const RawPermissionStatusSchema = z
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
export type RawPermissionStatus = z.infer<typeof RawPermissionStatusSchema>
