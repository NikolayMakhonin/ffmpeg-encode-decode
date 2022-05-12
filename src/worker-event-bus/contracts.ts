import {TransferListItem} from 'worker_threads'

export type IUnsubscribe = () => void
export interface IEventBus<TEvent> {
  subscribe(callback: (event: TEvent) => void): IUnsubscribe
  emit(event: TEvent)
}
export type TWorkerEvent<TData = any> = {
  data?: TData
  error?: Error
  transferList?: ReadonlyArray<TransferListItem>
}
export interface IWorkerEventBus<TData = any> extends IEventBus<TWorkerEvent<TData>> {

}

export class AbortError extends Error {

}
