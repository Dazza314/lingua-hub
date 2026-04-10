import type { Result } from '@praha/byethrow'
import type { z } from 'zod'
import type { LlmStreamError, UnexpectedLlmError } from '../errors'

export type MessageRole = 'user' | 'assistant'

export type MessageParam = {
  role: MessageRole
  content: string
}

export type GenerateObjectParams<T> = {
  schema: z.ZodType<T>
  system?: string
  messages: MessageParam[]
  maxTokens: number
}

export type DeepPartial<T> = T extends object
  ? T extends (infer U)[]
    ? DeepPartial<U>[]
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T

export type LlmClient = {
  generateObject<T>(
    params: GenerateObjectParams<T>,
  ): Result.ResultAsync<T, UnexpectedLlmError>
  streamObject<T>(
    params: GenerateObjectParams<T>,
  ): Result.ResultAsync<
    AsyncIterable<Result.Result<DeepPartial<T>, LlmStreamError>>,
    UnexpectedLlmError
  >
}
