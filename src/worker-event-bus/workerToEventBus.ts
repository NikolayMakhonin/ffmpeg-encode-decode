import {Worker} from 'node:worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from './contracts'
import {WorkerExitError} from './WorkerExitError'
import {createWorkerEvent} from './createWorkerEvent'

export function workerToEventBus<TRequestData = any, TResponseData = any>(
  worker: Worker,
): IWorkerEventBus<TRequestData, TResponseData> {
  return {
    subscribe(callback: (event: WorkerEvent<TResponseData>) => void): IUnsubscribe {
      function onError(error: Error) {
        callback(createWorkerEvent(void 0, error))
      }
      function onMessageError(error: Error) {
        callback(createWorkerEvent(void 0, error))
      }
      function onExit(code: number) {
        callback(createWorkerEvent(void 0, new WorkerExitError(code)))
      }
      function onMessage(event) {
        callback(event)
      }

      function unsubscribe() {
        worker.off('error', onError)
        worker.off('messageerror', onMessageError)
        worker.off('exit', onExit)
        worker.off('message', onMessage)
      }

      worker.on('error', onError)
      worker.on('messageerror', onMessageError)
      worker.on('exit', onExit)
      worker.on('message', onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TRequestData>) {
      worker.postMessage(event, event.transferList)
    },
  }
}
