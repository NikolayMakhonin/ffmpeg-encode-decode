import {MessagePort} from 'worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from './contracts'
import {WorkerExitError} from './WorkerExitError'
import {createWorkerEvent} from './createWorkerEvent'

export function messagePortToEventBus<TData = any>(messagePort: MessagePort): IWorkerEventBus<TData> {
  return {
    subscribe(callback: (event: WorkerEvent<TData>) => void): IUnsubscribe {
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
        messagePort.off('error', onError)
        messagePort.off('messageerror', onMessageError)
        messagePort.off('exit', onExit)
        messagePort.off('message', onMessage)
      }

      messagePort.on('error', onError)
      messagePort.on('messageerror', onMessageError)
      messagePort.on('exit', onExit)
      messagePort.on('message', onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TData>) {
      messagePort.postMessage(event, event.transferList)
    },
  }
}
