import {WorkerData} from '../common/contracts'

export type FunctionRequest<TRequestData = any> = {
  func: string,
  data: TRequestData,
}

export type WorkerFunctionClient<TRequestData = any, TResponseData = any>
  = (data: WorkerData<TRequestData>) => Promise<WorkerData<TResponseData>>


export type SubscribeAction = 'call' | 'abort' | 'unsubscribe'

export type SubscribeRequest<TRequestData = any> = {
  requestId: string,
} & ({
  data: TRequestData,
  type: 'call',
} | {
  data: void,
  type: 'abort' | 'abortUnsubscribe' | 'unsubscribe',
})

export type AbortFunc = (reason: any) => void
