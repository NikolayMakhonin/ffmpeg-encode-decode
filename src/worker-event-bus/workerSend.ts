import {IWorkerEventEmitter} from './contracts'
import {TransferListItem} from 'worker_threads'
import {createWorkerEvent} from './createWorkerEvent'

export function workerSend<TRequestData = any>({
  eventEmitter,
  data,
  transferList,
  requestId,
}: {
  eventEmitter: IWorkerEventEmitter<TRequestData>,
  data: TRequestData,
  transferList?: ReadonlyArray<TransferListItem>,
  requestId?: string,
}) {
  eventEmitter.emit(createWorkerEvent(data, void 0, transferList, requestId && [requestId]))
  return requestId
}
