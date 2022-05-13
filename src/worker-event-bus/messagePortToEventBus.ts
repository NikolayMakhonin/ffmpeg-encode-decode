import {MessagePort} from 'worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from './contracts'
import {CloseError} from './CloseError'

export function messagePortToEventBus<TData = any>(messagePort: MessagePort): IWorkerEventBus<TData> {
  return {
    subscribe(callback: (event: WorkerEvent<TData>) => void): IUnsubscribe {
      function onError(error: Error) {
        console.error(error)
      }
      function onMessageError(error: Error) {
        console.error(error)
      }
      function onClose() {
        console.error(new CloseError())
      }
      function onMessage(event) {
        callback(event)
      }

      function unsubscribe() {
        messagePort.off('messageerror', onMessageError)
        messagePort.off('close', onClose)
        messagePort.off('message', onMessage)
      }

      messagePort.on('messageerror', onMessageError)
      messagePort.on('close', onClose)
      messagePort.on('message', onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TData>) {
      messagePort.postMessage(event, event.transferList)
    },
  }
}
