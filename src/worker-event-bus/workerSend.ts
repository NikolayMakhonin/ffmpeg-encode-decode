import {IWorkerEventEmitter} from './contracts'
import {getNextId} from './getNextId'
import {TransferListItem} from 'worker_threads'

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
  eventEmitter.emit({data, transferList, route: requestId && [requestId]})
  return requestId
}
