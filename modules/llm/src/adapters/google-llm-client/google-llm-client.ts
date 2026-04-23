import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google'
import type { LlmClient } from '../../ports/llm-client'
import { createGenerateObject } from './generate-object'
import { createStreamObject } from './stream-object'

export const GoogleModel = {
  Gemini25Pro: 'gemini-2.5-pro',
  Gemini25Flash: 'gemini-2.5-flash',
  Gemini20Flash: 'gemini-2.0-flash',
} as const

export type GoogleModel = (typeof GoogleModel)[keyof typeof GoogleModel]

export function createGoogleLlmClient(
  apiKey: string,
  model: GoogleModel,
): LlmClient {
  const provider = createGoogleGenerativeAI({ apiKey })
  return {
    generateObject: createGenerateObject(provider, model),
    streamObject: createStreamObject(provider, model),
  }
}

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
