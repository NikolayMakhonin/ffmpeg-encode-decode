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

export type TWorkerRequestEvent<TData = any> = {
  data?: TData
  transferList?: ReadonlyArray<TransferListItem>
  route?: string[]
}
export type TWorkerResponseEvent<TData = any> = {
  data?: TData
  error?: Error
  transferList?: ReadonlyArray<TransferListItem>
  route?: string[]
}

export interface IWorkerEventEmitter<TRequestData = any>
  extends IEventEmitter<TWorkerRequestEvent<TRequestData>>
{ }
export interface IWorkerEventSubscriber<TResponseData = any>
  extends IEventSubscriber<TWorkerResponseEvent<TResponseData>>
{ }
export interface IWorkerEventBus<TRequestData = any, TResponseData = any>
  extends IWorkerEventEmitter<TRequestData>, IWorkerEventSubscriber<TResponseData>
{ }

export class AbortError extends Error {

}
