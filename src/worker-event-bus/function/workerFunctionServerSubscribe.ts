import {parentPort} from 'worker_threads'
import {IUnsubscribeAsync, IWorkerEventBus, PromiseOrValue, WorkerCallback, WorkerData} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'
import {FunctionRequest} from './contracts'

export type WorkerFunctionServerSubscribe<TRequestData = any, TResponseData = any>
  = (
    data: WorkerData<TRequestData>,
    callback: WorkerCallback<TResponseData>,
  ) => PromiseOrValue<IUnsubscribeAsync>

const unsubscribes = new Map<string, IUnsubscribeAsync>()

export function workerFunctionServer<TRequestData = any, TResponseData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResponseData, FunctionRequest<TRequestData>>,
  func: WorkerFunctionServerSubscribe<TRequestData, TResponseData>,
  name?: string,
}) {
  return eventBus.subscribe(async (event) => {
    if (event.error) {
      console.error(event.error)
      eventBus.emit(createWorkerEvent(void 0, event.error, event.route))
      return
    }

    if (!name) {
      name = func.name
    }

    try {
      if (event.data.data.func !== name) {
        return
      }
      if (!func) {
        eventBus.emit(createWorkerEvent(
          void 0,
          new Error('Unknown func: ' + event.data.data.func),
          event.route,
        ))
      }

      let unsubscribe = unsubscribes.get(event.route[0])

      if (unsubscribe) {
        await unsubscribe()

        parentPort.postMessage(createWorkerEvent<FunctionRequest<void>>(
          {},
          void 0,
          event.route,
        ))

        return
      }

      unsubscribe = await func({
        data        : event.data.data.data,
        transferList: event.data.transferList,
      }, (data, error) => {
        parentPort.postMessage(createWorkerEvent(
          data,
          error,
          event.route,
        ), data.transferList)
      })

      if (!unsubscribe) {
        eventBus.emit(createWorkerEvent(void 0, Error('unsubscribe == null'), event.route))
        return
      }

      parentPort.postMessage(createWorkerEvent<FunctionRequest<void>>(
        {
          data: {
            func: name,
            data: void 0,
          },
        },
        void 0,
        event.route,
      ))

      unsubscribes.set(event.route[0], unsubscribe)
    } catch (error) {
      eventBus.emit(createWorkerEvent(void 0, error, event.route))
    }
  })
}
