export class AbortError extends Error {
  readonly reason: any
  constructor(message?: string, reason?: any) {
    super(message)
    this.reason = reason
  }
}
