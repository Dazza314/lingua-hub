export class UnexpectedLlmError extends Error {
  override readonly name = 'UnexpectedLlmError' as const
}

export class LlmStreamError extends Error {
  override readonly name = 'LlmStreamError' as const
}
