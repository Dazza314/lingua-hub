import { langfuseSpanProcessor } from '@/instrumentation'
import { getAuthenticatedUserId } from '@/lib/auth'
import { env } from '@/lib/env'
import { evaluateExercise } from '@/lib/evaluate-exercise'
import { mockEvaluateExercise } from '@/mocks/evaluate-exercise'
import { observe, propagateAttributes } from '@langfuse/tracing'
import { Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { after } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  exercise: Exercise.exerciseSchema,
  userTranslation: z.string().min(1),
})

const llmHandler = env.MOCK_LLM ? mockEvaluateExercise : evaluateExercise

const encoder = new TextEncoder()

async function handler(request: Request) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    return new Response(null, { status: 401 })
  }

  const userId = authResult.value

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(null, { status: 400 })
  }

  const { exercise, userTranslation } = parsed.data

  return propagateAttributes({ userId }, async () => {
    const iterable = await llmHandler(exercise, userTranslation)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of iterable) {
          if (Result.isSuccess(chunk)) {
            controller.enqueue(
              encoder.encode(JSON.stringify(chunk.value) + '\n'),
            )
          } else {
            controller.error(chunk.error)
            return
          }
        }
        controller.close()
      },
    })

    after(async () => await langfuseSpanProcessor.forceFlush())

    return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    })
  })
}

export const POST = observe(handler, { name: 'exercise-evaluation' })
