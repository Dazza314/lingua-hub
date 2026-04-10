import type { AnthropicProvider } from '@ai-sdk/anthropic'
import type { LlmClient } from '../../ports/llm-client'
import { createGenerateObject } from './generate-object'
import { createStreamObject } from './stream-object'

type LlmClientFactories = {
  [Key in keyof LlmClient as `create${Capitalize<Key>}`]: (
    provider: AnthropicProvider,
    model: string,
  ) => LlmClient[Key]
}

export const claudeLlmClientFactories = {
  createGenerateObject,
  createStreamObject,
} satisfies LlmClientFactories
