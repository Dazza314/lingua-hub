import { langfuseSpanProcessor } from '@/instrumentation'
import { getAuthenticatedUserId } from '@/lib/auth'
import { env } from '@/lib/env'
import { parseExerciseScope } from '@/lib/exercise-scope'
import { generateExercise } from '@/lib/generate-exercise'
import { mockGenerateExercise } from '@/mocks/generate-exercise'
import { observe, propagateAttributes } from '@langfuse/tracing'
import { Result } from '@praha/byethrow'
import { after } from 'next/server'

const llmHandler = env.MOCK_LLM ? mockGenerateExercise : generateExercise

const encoder = new TextEncoder()

async function handler(request: Request) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    return new Response(null, { status: 401 })
  }

  const userId = authResult.value
  const scope = parseExerciseScope(
    new URL(request.url).searchParams.get('scope'),
  )

  return propagateAttributes({ userId }, async () => {
    const result = await llmHandler(scope ?? undefined)

    if (Result.isFailure(result)) {
      return Response.json(
        { error: { type: result.error.type, message: result.error.message } },
        { status: 422 },
      )
    }

    const iterable = result.value

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

export const POST = observe(handler, { name: 'exercise-generation' })
