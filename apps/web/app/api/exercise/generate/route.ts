import { getAuthenticatedUserId } from '@/lib/auth'
import { env } from '@/lib/env'
import { generateExercise } from '@/lib/generate-exercise'
import { mockGenerateExercise } from '@/mocks/generate-exercise'
import { Result } from '@praha/byethrow'

const handler = env.MOCK_LLM ? mockGenerateExercise : generateExercise

const encoder = new TextEncoder()

export async function POST() {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    return new Response(null, { status: 401 })
  }

  const result = await handler()

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
          controller.enqueue(encoder.encode(JSON.stringify(chunk.value) + '\n'))
        } else {
          controller.error(chunk.error)
          return
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
