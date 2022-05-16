import {IUnsubscribeAsync, IWorkerEventBus, WorkerData} from '../common/contracts'
import {FunctionRequest} from './contracts'
import {workerRequestSubscribe} from '../request/workerRequestSubscribe'

export function workerFunctionSubscribe<TRequestData = any, TResponseData = any>({
  eventBus,
  name,
}: {
  eventBus: IWorkerEventBus<FunctionRequest<TRequestData>, TResponseData>,
  name: string,
}) {
  function func(
    data: WorkerData<TRequestData>,
    callback: (data: WorkerData<TResponseData>, error?: Error) => void,
    abortSignal?: AbortSignal,
  ): Promise<IUnsubscribeAsync> {
    return workerRequestSubscribe({
      eventBus,
      data: {
        data: {
          func: name,
          data: data.data,
        },
        transferList: data.transferList,
      },
      callback,
      abortSignal,
    })
  }
  Object.defineProperty(func, 'name', {value: name, writable: false})
  return func
}
