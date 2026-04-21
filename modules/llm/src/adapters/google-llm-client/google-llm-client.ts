import type { GoogleGenerativeAIProvider } from '@ai-sdk/google'
import type { LlmClient } from '../../ports/llm-client'
import { createGenerateObject } from './generate-object'
import { createStreamObject } from './stream-object'

type LlmClientFactories = {
  [Key in keyof LlmClient as `create${Capitalize<Key>}`]: (
    provider: GoogleGenerativeAIProvider,
    model: string,
  ) => LlmClient[Key]
}

export const googleLlmClientFactories = {
  createGenerateObject,
  createStreamObject,
} satisfies LlmClientFactories
