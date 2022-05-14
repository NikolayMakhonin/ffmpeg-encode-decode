import {IWorkerEventEmitter, WorkerData} from './contracts'
import {createWorkerEvent} from './createWorkerEvent'

export function workerSend<TRequestData = any>({
  eventEmitter,
  data,
  requestId,
}: {
  eventEmitter: IWorkerEventEmitter<TRequestData>,
  data: WorkerData<TRequestData>,
  requestId?: string,
}) {
  eventEmitter.emit(createWorkerEvent(data, void 0, requestId && [requestId]))
  return requestId
}
