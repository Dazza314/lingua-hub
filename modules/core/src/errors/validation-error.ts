export class ValidationError extends Error {
  override readonly name = 'ValidationError' as const
}
