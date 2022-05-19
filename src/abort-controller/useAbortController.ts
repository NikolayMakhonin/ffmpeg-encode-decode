import {AbortControllerImpl} from './AbortController'

export async function useAbortController<T>(func: (abortSignal: AbortSignal) => Promise<T> | T): Promise<T> {
  const abortController = new AbortControllerImpl()
  try {
    return await func(abortController.signal)
  } finally {
    abortController.abort()
  }
}
