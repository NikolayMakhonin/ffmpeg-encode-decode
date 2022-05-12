import {IUnsubscribe, IWorkerEventSubscriber} from './contracts'
import {routePop} from './route'
import {AbortError} from '../abort-controller/AbortError'

export function workerSubscribe<TResponseData = any>({
  eventBus,
  requestId,
  abortSignal,
}: {
  eventBus: IWorkerEventSubscriber<TResponseData>,
  requestId: string,
  abortSignal?: AbortSignal,
}): Promise<TResponseData> {
  return new Promise<TResponseData>((_resolve, _reject) => {
    if (abortSignal.aborted) {
      throw new AbortError()
    }

    let unsubscribeEventBus: IUnsubscribe

    function unsubscribe() {
      abortSignal.removeEventListener('abort', unsubscribe)
      if (unsubscribeEventBus) {
        unsubscribeEventBus()
      }
    }

    function resolve(responseData: TResponseData) {
      unsubscribe()
      _resolve(responseData)
    }

    function reject(err: Error) {
      unsubscribe()
      _reject(err)
    }

    abortSignal.addEventListener('abort', unsubscribe)

    try {
      unsubscribeEventBus = eventBus.subscribe(({data, error, route}) => {
        try {
          if (!routePop(route, requestId)) {
            return
          }
        } catch (err) {
          reject(err)
        }
        if (route.length) {
          reject(new Error(`route.length == ${route.length}`))
        }
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

    if (abortSignal.aborted) {
      throw new AbortError()
    }
  })
}
