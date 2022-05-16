import {IWorkerEventEmitter, WorkerData} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'

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
