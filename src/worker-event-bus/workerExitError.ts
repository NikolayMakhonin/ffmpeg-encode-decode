export class WorkerExitError extends Error {
  code: number

  constructor(code: number) {
    super()
    this.code = code
  }
}
