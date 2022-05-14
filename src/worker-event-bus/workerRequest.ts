import {IWorkerEventBus, WorkerData} from './contracts'
import {useAbortController} from '../abort-controller/useAbortController'
import {combineAbortSignals} from '../abort-controller/combineAbortSignals'
import {workerSend} from './workerSend'
import {getNextId} from './getNextId'
import {workerWait} from './workerWait'

export function workerRequest<
  TRequestData = any,
  TResponseData = any,
>({
  eventBus,
  data,
  abortSignal,
}: {
  eventBus: IWorkerEventBus<TRequestData, TResponseData>,
  data: WorkerData<TRequestData>,
  abortSignal?: AbortSignal,
}): Promise<WorkerData<TResponseData>> {
  return useAbortController((signal) => {
    const requestId = getNextId()

    const promise = workerWait({
      eventBus,
      requestId,
      abortSignal: combineAbortSignals(abortSignal, signal),
    })

    workerSend({
      eventEmitter: eventBus,
      data,
      requestId,
    })

    return promise
  })
}
