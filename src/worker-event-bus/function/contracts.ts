import {WorkerData} from '../common/contracts'

export type FunctionRequestType = 'call' | 'abort' | 'unsubscribe'

export type FunctionRequest<TRequestData = any> = {
  func: string,
} & ({
  data: TRequestData,
  type: 'call',
} | {
  data: any,
  type: 'abort',
} | {
  data: any,
  type: 'abortUnsubscribe',
} | {
  data: void,
  type: 'unsubscribe',
})

export type WorkerFunctionClient<TRequestData = any, TResponseData = any>
  = (data: WorkerData<TRequestData>) => Promise<WorkerData<TResponseData>>
