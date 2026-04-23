import type { GoogleGenerativeAIProvider } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import type { GenerateObjectParams, LlmClient } from '../../ports/llm-client'

export function createGenerateObject(
  provider: GoogleGenerativeAIProvider,
  model: string,
): LlmClient['generateObject'] {
  return async <T>(params: GenerateObjectParams<T>) => {
    const result = await generateText({
      model: provider(model),
      output: Output.object({ schema: params.schema }),
      system: params.system,
      messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
      maxOutputTokens: params.maxTokens,
    })
    return result.output
  }
}
