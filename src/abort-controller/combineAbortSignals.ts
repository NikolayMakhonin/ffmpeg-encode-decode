import {AbortControllerImpl} from './AbortController'

export function combineAbortSignals(...abortSignals: AbortSignal[]): AbortSignal {
  const abortController = new AbortControllerImpl()

  function onAbort(this: AbortSignal) {
    abortController.abort((this as any).reason)
  }

  for (let i = 0; i < abortSignals.length; i++) {
    const abortSignal = abortSignals[i]
    if (!abortSignal) {
      continue
    }
    if (abortSignal.aborted) {
      onAbort.call(abortSignal)
      break
    } else {
      abortSignal.addEventListener('abort', onAbort)
    }
  }

  return abortController.signal
}
