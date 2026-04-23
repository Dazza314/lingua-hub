export abstract class TypedError extends Error {
  abstract readonly type: string
  override get name(): string {
    return this.type
  }
}
