import {IWorkerEventSubscriber, WorkerData} from './contracts'
import {workerSubscribe} from './workerSubscribe'
import {subscribeOnceAsPromise} from './subscribeOnceAsPromise'

export function workerWait<TResponseData = any>({
  eventBus,
  requestId,
  abortSignal,
}: {
  eventBus: IWorkerEventSubscriber<TResponseData>,
  requestId: string,
  abortSignal?: AbortSignal,
}): Promise<WorkerData<TResponseData>> {
  return subscribeOnceAsPromise<WorkerData<TResponseData>>({
    subscribe(callback) {
      return workerSubscribe({
        eventBus,
        requestId,
        callback,
      })
    },
    abortSignal,
  })
}
