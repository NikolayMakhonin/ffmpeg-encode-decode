import {IWorkerEventBus, WorkerData} from '../contracts'
import {workerRequest} from '../workerRequest'
import {FunctionRequest} from './contracts'

export function workerFunctionClient<TRequestData = any, TResponseData = any>({
  eventBus,
  name,
}: {
  eventBus: IWorkerEventBus<FunctionRequest<TRequestData>, TResponseData>,
  name: string,
}) {
  function func(
    data: WorkerData<TRequestData>,
    abortSignal?: AbortSignal,
  ) {
    return workerRequest({
      eventBus,
      data: {
        data: {
          func: name,
          data: data.data,
        },
        transferList: data.transferList,
      },
      abortSignal,
    })
  }
  Object.defineProperty(func, 'name', {value: name, writable: false})
  return func
}
