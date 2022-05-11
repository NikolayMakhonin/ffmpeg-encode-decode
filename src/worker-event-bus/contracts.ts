import {TransferListItem} from 'worker_threads'

export type IUnsubscribe = () => void
export interface IWorkerEventBus<TData = any> {
  subscribe(callback: (data: TData, error?: Error) => void): IUnsubscribe
  emit(data: TData, transferList?: ReadonlyArray<TransferListItem>)
}

export class AbortError extends Error {

}
