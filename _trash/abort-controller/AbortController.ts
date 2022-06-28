import { AbortSignalImpl } from './AbortSignal'

export class AbortControllerImpl implements AbortController {
  readonly signal: AbortSignalImpl

  constructor() {
    // @ts-ignore
    this.signal = new AbortSignalImpl()
  }

  abort(): void
  abort(reason?: any): void
  abort(reason?: any): void {
    // @ts-ignore
    this.signal._abort(reason)
  }
}
