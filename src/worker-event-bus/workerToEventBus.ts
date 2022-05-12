import {Worker} from 'node:worker_threads'
import {IUnsubscribe, IWorkerEventBus, TWorkerEvent} from './contracts'
import {WorkerExitError} from './workerExitError'

export function workerToEventBus<TData = any>(worker: Worker): IWorkerEventBus<TData> {
  return {
    subscribe(callback: (event: TWorkerEvent<TData>) => void): IUnsubscribe {
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
    emit(event: TWorkerEvent<TData>) {
      worker.postMessage(event, event.transferList)
    },
  }
}
