import {AbortController} from './AbortController'

export function combineAbortSignals(...abortSignals: AbortSignal[]) {
  const abortController = new AbortController()

  function onAbort() {
    abortController.abort()
  }

  for (let i = 0; i < abortSignals.length; i++) {
    const abortSignal = abortSignals[i]
    if (!abortSignal) {
      continue
    }
    if (abortSignal.aborted) {
      onAbort()
      break
    } else {
      abortSignal.addEventListener('abort', onAbort)
    }
  }

  return abortController.signal
}
