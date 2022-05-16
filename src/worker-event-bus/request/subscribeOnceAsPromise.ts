import {IUnsubscribe} from '../common/contracts'
import {AbortError} from '../../abort-controller/AbortError'

export function subscribeOnceAsPromise<TData = any, TError = Error>({
  subscribe,
  abortSignal,
}: {
  subscribe: (callback: (data: TData, error: TError) => void) => IUnsubscribe,
  abortSignal?: AbortSignal,
}): Promise<TData> {
  return new Promise<TData>((_resolve, _reject) => {
    if (abortSignal?.aborted) {
      throw new AbortError()
    }

    let unsubscribeEventBus: IUnsubscribe

    function unsubscribe() {
      abortSignal?.removeEventListener('abort', unsubscribe)
      if (unsubscribeEventBus) {
        unsubscribeEventBus()
      }
    }

    function resolve(data: TData) {
      unsubscribe()
      _resolve(data)
    }

    function reject(err: TError) {
      unsubscribe()
      _reject(err)
    }

    abortSignal?.addEventListener('abort', unsubscribe)

    try {
      unsubscribeEventBus = subscribe((data, error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(data)
      })
    } catch (err) {
      unsubscribe()
      throw err
    }

    if (abortSignal?.aborted) {
      unsubscribe()
      throw new AbortError()
    }
  })
}
