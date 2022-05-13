import {parentPort, TransferListItem} from 'worker_threads'
import {IWorkerEventBus} from '../contracts'
import {createWorkerEvent} from '../createWorkerEvent'
import {FunctionRequest} from './contracts'

type PromiseOrValue<T> = Promise<T> | T
// interface IPromiseOrValue<T> extends Promise<PromiseOrValue<T>> { }

export type WorkerFunctionServerResult<TResult> = PromiseOrValue<[
  result: TResult,
  transferList?: ReadonlyArray<TransferListItem>
]>

export type WorkerFunctionServer<TArgs extends any[] = any[], TResult = any>
  = (...args: TArgs) => WorkerFunctionServerResult<TResult>

export function workerFunctionServer<TArgs extends any[] = any[], TResult = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResult, FunctionRequest<TArgs>>,
  func: WorkerFunctionServer<TArgs, TResult>,
  name?: string,
}) {
  return eventBus.subscribe(async (event) => {
    if (event.error) {
      console.error(event.error)
      eventBus.emit(createWorkerEvent(void 0, event.error, void 0, event.route))
      return
    }

    if (!name) {
      name = func.name
    }

    try {
      if (event.data.func !== name) {
        return
      }
      if (!func) {
        eventBus.emit(createWorkerEvent(
          void 0,
          new Error('Unknown func: ' + event.data.func),
          void 0,
          event.route,
        ))
      }
      const [result, transferList] = (await func.apply(null, event.data.args)) || []
      parentPort.postMessage(createWorkerEvent(
        result,
        void 0,
        transferList,
        event.route,
      ), transferList)
    } catch (error) {
      eventBus.emit(createWorkerEvent(void 0, error, void 0, event.route))
    }
  })
}
