import {parentPort} from 'worker_threads'
import {IWorkerEventBus, WorkerData} from '../contracts'
import {createWorkerEvent} from '../createWorkerEvent'
import {FunctionRequest} from './contracts'

type PromiseOrValue<T> = Promise<T> | T
// interface IPromiseOrValue<T> extends Promise<PromiseOrValue<T>> { }

export type WorkerFunctionServerResult<TData> = PromiseOrValue<WorkerData<TData>>

export type WorkerFunctionServer<TRequestData = any, TResponseData = any>
  = (data: WorkerData<TRequestData>) => WorkerFunctionServerResult<TResponseData>

export function workerFunctionServer<TRequestData = any, TResponseData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResponseData, FunctionRequest<TRequestData>>,
  func: WorkerFunctionServer<TRequestData, TResponseData>,
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
      const data = await func({
        data        : event.data.data.data,
        transferList: event.data.transferList,
      }) || {}
      parentPort.postMessage(createWorkerEvent(
        data,
        void 0,
        event.route,
      ), data.transferList)
    } catch (error) {
      eventBus.emit(createWorkerEvent(void 0, error, event.route))
    }
  })
}
