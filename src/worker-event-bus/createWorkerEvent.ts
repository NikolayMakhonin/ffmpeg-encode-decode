import {WorkerEvent} from './contracts'
import {TransferListItem} from 'worker_threads'

export function createWorkerEvent<TData = any>(
  data: TData,
  error?: Error,
  transferList?: ReadonlyArray<TransferListItem>,
  route?: string[],
): WorkerEvent {
  return {
    data,
    error,
    transferList,
    route,
  }
}
