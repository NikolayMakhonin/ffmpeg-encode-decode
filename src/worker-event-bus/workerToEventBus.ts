import {Worker} from 'node:worker_threads'
import {IUnsubscribe, IWorkerEventBus, TWorkerRequestEvent, TWorkerResponseEvent} from './contracts'
import {WorkerExitError} from './workerExitError'

export function workerToEventBus<TRequestData = any, TResponseData = any>(
  worker: Worker,
): IWorkerEventBus<TRequestData, TResponseData> {
  return {
    subscribe(callback: (event: TWorkerResponseEvent<TResponseData>) => void): IUnsubscribe {
      function onError(error: Error) {
        callback({error})
      }
      function onMessageError(error: Error) {
        callback({error})
      }
      function onExit(code: number) {
        callback({error: new WorkerExitError(code)})
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
    emit(event: TWorkerRequestEvent<TRequestData>) {
      worker.postMessage(event, event.transferList)
    },
  }
}
