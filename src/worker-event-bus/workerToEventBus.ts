import {Worker} from 'node:worker_threads'
import {IUnsubscribe, IWorkerEventBus} from './contracts'
import {TransferListItem} from 'worker_threads'
import {WorkerExitError} from './workerExitError'

export function workerToEventBus<TData = any>(worker: Worker): IWorkerEventBus<TData> {
  return {
    subscribe(callback: (data: TData, error?: Error) => void): IUnsubscribe {
      function onError(error: Error) {
        callback(void 0, error)
      }
      function onMessageError(error: Error) {
        callback(void 0, error)
      }
      function onExit(code: number) {
        callback(void 0, new WorkerExitError(code))
      }
      function onMessage(data) {
        callback(data)
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
    emit(value: any, transferList?: ReadonlyArray<TransferListItem>) {
      worker.postMessage(value, transferList)
    },
  }
}
