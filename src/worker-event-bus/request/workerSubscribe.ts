import {IUnsubscribe, IWorkerEventSubscriber, WorkerData} from '../common/contracts'
import {routePop} from '../common/route'

export function workerSubscribe<TResponseData = any>({
  eventBus,
  requestId,
  callback,
}: {
  eventBus: IWorkerEventSubscriber<TResponseData>,
  requestId: string,
  callback: (data: WorkerData<TResponseData>, error?: Error) => void,
}): IUnsubscribe {
  let unsubscribeEventBus: IUnsubscribe

  function unsubscribe() {
    if (unsubscribeEventBus) {
      unsubscribeEventBus()
    }
  }

  try {
    unsubscribeEventBus = eventBus.subscribe(({
      data,
      error,
      route,
    }) => {
      try {
        if (!routePop(route, requestId)) {
          return
        }
      } catch (err) {
        callback(void 0, err)
      }
      if (route.length) {
        callback(void 0, new Error(`route.length == ${route.length}`))
      }
      if (error) {
        callback(void 0, error)
        return
      }
      callback(data)
    })
  } catch (err) {
    unsubscribe()
    throw err
  }

  return unsubscribe
}
