export class WorkerExitError extends Error {
  code: number

  constructor(code: number) {
    super(`Exit code: ${code}`)
    this.code = code
  }
}
