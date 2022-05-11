import {IWorkerEventBus} from './contracts'
import {useAbortController} from '../abort-controller/useAbortController'
import {combineAbortSignals} from '../abort-controller/combineAbortSignals'
import {workerRequestSubscribe, WorkerRequestSubscribeConfig} from './workerRequestSubscribe'
import {workerRequestSend, WorkerRequestSendConfig} from './workerRequestSend'
import {getNextRequestId} from './getNextRequestId'
import {TransferListItem} from 'worker_threads'

export type WorkerRequestConfig<TRequestData = any, TResponseData = any, TResponse = any> =
  WorkerRequestSubscribeConfig<TResponseData, TResponse> & WorkerRequestSendConfig<TRequestData>

export function workerRequest<
  TRequestData = any,
  TResponseData = any,
  TResponse = any
>({
  eventBus,
  data,
  transferList,
  abortSignal,
  config: {
    responseFilter,
    getResponseData,
    createRequest,
  },
}: {
  eventBus: IWorkerEventBus,
  data: TRequestData,
  transferList?: ReadonlyArray<TransferListItem>,
  abortSignal?: AbortSignal,
  config: WorkerRequestConfig<TRequestData, TResponseData, TResponse>,
}): Promise<TResponseData> {
  return useAbortController((signal) => {
    const requestId = getNextRequestId()

    const promise = workerRequestSubscribe({
      eventBus,
      requestId,
      abortSignal: combineAbortSignals(abortSignal, signal),
      config     : {
        responseFilter(response) {
          return responseFilter(response, requestId)
        },
        getResponseData,
      },
    })

    workerRequestSend({
      eventBus,
      data,
      transferList,
      requestId,
      config: {
        createRequest,
      },
    })

    return promise
  })
}
