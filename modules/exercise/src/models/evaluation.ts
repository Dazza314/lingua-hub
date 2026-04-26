import { z } from 'zod'

export const evaluationSchema = z
  .object({
    isAcceptable: z.boolean(),
    feedback: z.string(),
    suggestedTranslation: z.string().nullable(),
  })
  .superRefine((val, ctx) => {
    if (!val.isAcceptable && val.suggestedTranslation === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'suggestedTranslation is required when isAcceptable is false',
        path: ['suggestedTranslation'],
      })
    }
  })

export type Evaluation = z.infer<typeof evaluationSchema>
