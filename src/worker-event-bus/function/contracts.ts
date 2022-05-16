import {WorkerData} from '../common/contracts'

export type FunctionRequest<TRequestData = any> = {
  func: string,
  data: TRequestData,
}

export type WorkerFunctionClient<TRequestData = any, TResponseData = any>
  = (data: WorkerData<TRequestData>) => Promise<WorkerData<TResponseData>>
