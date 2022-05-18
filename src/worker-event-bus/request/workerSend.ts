import {IWorkerEventEmitter, WorkerData} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'

export function workerSend<TRequest = any>({
  eventEmitter,
  data,
  requestId,
}: {
  eventEmitter: IWorkerEventEmitter<TRequest>,
  data: WorkerData<TRequest>,
  requestId?: string,
}) {
  eventEmitter.emit(createWorkerEvent(data, void 0, requestId && [requestId]))
  return requestId
}
