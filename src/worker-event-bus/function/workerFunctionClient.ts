import {TransferListItem} from 'worker_threads'
import {IWorkerEventBus} from '../contracts'
import {workerRequest} from '../workerRequest'
import {FunctionRequest} from './contracts'

export function workerFunctionClient<TArgs extends any[] = any[], TResult = any>({
  eventBus,
  name,
}: {
  eventBus: IWorkerEventBus<FunctionRequest<TArgs>, TResult>,
  name: string,
}) {
  return function _workerFunctionClient(
    args: TArgs,
    transferList?: ReadonlyArray<TransferListItem>,
    abortSignal?: AbortSignal,
  ) {
    return workerRequest({
      eventBus,
      data: {
        func: name,
        args,
      },
      transferList,
      abortSignal,
    })
  }
}
