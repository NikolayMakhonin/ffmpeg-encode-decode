export async function useAbortController<T>(func: (abortSignal: AbortSignal) => Promise<T> | T): Promise<T> {
  const abortController = new AbortController()
  try {
    return await func(abortController.signal)
  } finally {
    abortController.abort()
  }
}
