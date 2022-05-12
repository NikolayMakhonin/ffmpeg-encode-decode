import {MessagePort} from 'node:worker_threads'
import {IUnsubscribe, IWorkerEventBus, TWorkerEvent} from './contracts'
import {WorkerExitError} from './workerExitError'

export function messagePortToEventBus<TData = any>(messagePort: MessagePort): IWorkerEventBus<TData> {
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
    emit(event: TWorkerEvent<TData>) {
      messagePort.postMessage(event, event.transferList)
    },
  }
}
