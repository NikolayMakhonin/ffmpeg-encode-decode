import {IWorkerEventBus, WorkerData} from '../common/contracts'
import {useAbortController} from '../../abort-controller/useAbortController'
import {combineAbortSignals} from '../../abort-controller/combineAbortSignals'
import {workerSend} from './workerSend'
import {getNextId} from '../common/getNextId'
import {workerWait} from './workerWait'

export function workerRequest<
  TRequestData = any,
  TResponseData = any,
>({
  eventBus,
  data,
  abortSignal,
  requestId,
}: {
  eventBus: IWorkerEventBus<TRequestData, TResponseData>,
  data: WorkerData<TRequestData>,
  abortSignal?: AbortSignal,
  requestId?: string,
}): Promise<WorkerData<TResponseData>> {
  return useAbortController((signal) => {
    if (!requestId) {
      requestId = getNextId()
    }

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
