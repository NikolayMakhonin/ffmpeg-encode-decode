import {TransferListItem} from 'worker_threads'

export type PromiseOrValue<T> = Promise<T> | T

export type IUnsubscribe = () => void

export type IUnsubscribeAsync = (abortSignal?: AbortSignal) => PromiseOrValue<void>

export type Callback<TData = any, TError = Error> = (data: TData, error?: TError) => void

export interface IEventEmitter<TEmitEvent> {
  emit(event: TEmitEvent)
}
export interface IEventSubscriber<TSubscribeEvent> {
  subscribe(callback: (event: TSubscribeEvent) => void): IUnsubscribe
}
export interface IEventBus<TEmitEvent, TSubscribeEvent>
  extends IEventEmitter<TEmitEvent>, IEventSubscriber<TSubscribeEvent>
{ }

export type WorkerData<TData = any> = {
  data?: TData
  transferList?: ReadonlyArray<TransferListItem>
}

export type WorkerCallback<TData = any> = Callback<WorkerData<TData>>

export type WorkerEvent<TData = any> = {
  data?: WorkerData<TData>
  error?: Error
  route?: string[]
}

export interface IWorkerEventEmitter<TRequestData = any>
  extends IEventEmitter<WorkerEvent<TRequestData>>
{ }
export interface IWorkerEventSubscriber<TResponseData = any>
  extends IEventSubscriber<WorkerEvent<TResponseData>>
{ }
export interface IWorkerEventBus<TRequestData = any, TResponseData = any>
  extends IWorkerEventEmitter<TRequestData>, IWorkerEventSubscriber<TResponseData>
{ }

