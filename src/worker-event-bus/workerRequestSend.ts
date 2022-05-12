import {IWorkerEventEmitter} from './contracts'
import {getNextId} from './getNextId'
import {TransferListItem} from 'worker_threads'

export function workerRequestSend<TRequestData = any>({
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
  if (!requestId) {
    requestId = getNextId()
  }
  eventEmitter.emit({data, transferList, route: [requestId]})
  return requestId
}
