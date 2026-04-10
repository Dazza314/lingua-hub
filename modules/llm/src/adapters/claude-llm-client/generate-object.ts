import type { AnthropicProvider } from '@ai-sdk/anthropic'
import { Result } from '@praha/byethrow'
import { generateText, Output } from 'ai'
import { UnexpectedLlmError } from '../../errors'
import type { GenerateObjectParams, LlmClient } from '../../ports/llm-client'

export function createGenerateObject(
  provider: AnthropicProvider,
  model: string,
): LlmClient['generateObject'] {
  return <T>(params: GenerateObjectParams<T>) =>
    Result.try({
      try: async () => {
        const result = await generateText({
          model: provider(model),
          output: Output.object({ schema: params.schema }),
          system: params.system,
          messages: params.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          maxOutputTokens: params.maxTokens,
        })
        return result.output
      },
      catch: (err) =>
        new UnexpectedLlmError(
          err instanceof Error ? err.message : 'Unknown LLM error',
          {
            cause: err,
          },
        ),
    })
}
