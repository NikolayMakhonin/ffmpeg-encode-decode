import {IWorkerEventBus} from './contracts'
import {getNextRequestId} from './getNextRequestId'
import {TransferListItem} from 'worker_threads'

export type WorkerRequestSendConfig<TRequestData = any> = {
  createRequest: (data: TRequestData, requestId: string) => any
}

export function workerRequestSend<
  TRequestData = any,
>({
  eventBus,
  data,
  transferList,
  requestId,
  config: {
    createRequest,
  },
}: {
  eventBus: IWorkerEventBus,
  data: TRequestData,
  transferList?: ReadonlyArray<TransferListItem>,
  requestId?: string,
  config: WorkerRequestSendConfig<TRequestData>,
}) {
  if (!requestId) {
    requestId = getNextRequestId()
  }
  const request = createRequest(data, requestId)
  eventBus.emit({data: request, transferList})
  return requestId
}
