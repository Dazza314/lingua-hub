export abstract class TypedError extends Error {
  abstract readonly type: string
  readonly context?: unknown

  constructor(
    message?: string,
    options?: ErrorOptions & { context?: unknown },
  ) {
    super(message, options)
    this.context = options?.context
  }

  override get name(): string {
    return this.type
  }
}
