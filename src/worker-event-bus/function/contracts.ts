import {TransferListItem} from 'worker_threads'

export type FunctionRequest<TArgs extends any[] = any[]> = {
  func: string,
  args: TArgs,
}

export type WorkerFunctionClient<TArgs extends any[] = any[], TResult = any>
  = (args: TArgs, transferList?: ReadonlyArray<TransferListItem>) => Promise<TResult>
