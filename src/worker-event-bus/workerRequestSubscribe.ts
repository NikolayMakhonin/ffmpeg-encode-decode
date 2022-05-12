import {AbortError, IUnsubscribe, IWorkerEventBus} from './contracts'

export type WorkerRequestSubscribeConfig<TResponseData = any,
  TResponse = any,
  > = {
  responseFilter: (response: TResponse, requestId: string) => boolean
  getResponseData: (response: TResponse) => TResponseData
}

export function workerRequestSubscribe<TResponseData = any,
  TResponse = any>({
  eventBus,
  requestId,
  abortSignal,
  config: {
    responseFilter,
    getResponseData,
  },
}: {
  eventBus: IWorkerEventBus,
  requestId: string,
  abortSignal?: AbortSignal,
  config: WorkerRequestSubscribeConfig<TResponseData, TResponse>,
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
      unsubscribeEventBus = eventBus.subscribe(({data: response, error}) => {
        if (error) {
          reject(error)
          return
        }
        try {
          if (!responseFilter(response, requestId)) {
            return
          }
          const responseData = getResponseData(response)
          resolve(responseData)
        } catch (err) {
          reject(err)
        }
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
