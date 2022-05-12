import {IWorkerEventBus} from './contracts'
import {useAbortController} from '../abort-controller/useAbortController'
import {combineAbortSignals} from '../abort-controller/combineAbortSignals'
import {workerSubscribe} from './workerSubscribe'
import {workerSend} from './workerSend'
import {getNextId} from './getNextId'
import {TransferListItem} from 'worker_threads'

export function workerRequest<
  TRequestData = any,
  TResponseData = any,
>({
  eventBus,
  data,
  transferList,
  abortSignal,
}: {
  eventBus: IWorkerEventBus<TRequestData, TResponseData>,
  data: TRequestData,
  transferList?: ReadonlyArray<TransferListItem>,
  abortSignal?: AbortSignal,
}): Promise<TResponseData> {
  return useAbortController((signal) => {
    const requestId = getNextId()

    const promise = workerSubscribe({
      eventBus,
      requestId,
      abortSignal: combineAbortSignals(abortSignal, signal),
    })

    workerSend({
      eventEmitter: eventBus,
      data,
      transferList,
      requestId,
    })

    return promise
  })
}
