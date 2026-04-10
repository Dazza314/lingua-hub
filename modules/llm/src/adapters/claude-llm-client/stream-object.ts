import type { AnthropicProvider } from '@ai-sdk/anthropic'
import { Result } from '@praha/byethrow'
import { Output, streamText } from 'ai'
import { LlmStreamError, UnexpectedLlmError } from '../../errors'
import type { DeepPartial, GenerateObjectParams, LlmClient } from '../../ports/llm-client'

export function createStreamObject(
  provider: AnthropicProvider,
  model: string,
): LlmClient['streamObject'] {
  return <T>(params: GenerateObjectParams<T>) =>
    Result.try({
      try: async () => {
        const result = streamText({
          model: provider(model),
          output: Output.object({ schema: params.schema }),
          system: params.system,
          messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
          maxOutputTokens: params.maxTokens,
        })

        return (async function* () {
          try {
            for await (const partial of result.partialOutputStream) {
              yield Result.succeed(partial as DeepPartial<T>)
            }
          } catch (err) {
            yield Result.fail(
              new LlmStreamError(err instanceof Error ? err.message : 'Stream error', {
                cause: err,
              }),
            )
          }
        })()
      },
      catch: (err) =>
        new UnexpectedLlmError(err instanceof Error ? err.message : 'Unknown LLM error', {
          cause: err,
        }),
    })
}
