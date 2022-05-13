import {TransferListItem} from 'worker_threads'

export type IUnsubscribe = () => void
export interface IEventEmitter<TEmitEvent> {
  emit(event: TEmitEvent)
}
export interface IEventSubscriber<TSubscribeEvent> {
  subscribe(callback: (event: TSubscribeEvent) => void): IUnsubscribe
}
export interface IEventBus<TEmitEvent, TSubscribeEvent>
  extends IEventEmitter<TEmitEvent>, IEventSubscriber<TSubscribeEvent>
{ }

export type WorkerEvent<TData = any> = {
  data?: TData
  error?: Error
  transferList?: ReadonlyArray<TransferListItem>
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

