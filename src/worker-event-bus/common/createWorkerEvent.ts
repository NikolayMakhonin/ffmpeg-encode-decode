import {WorkerData, WorkerEvent} from './contracts'

export function createWorkerEvent<TData = any>(
  data: WorkerData<TData>,
  error: Error,
  route: string[],
): WorkerEvent {
  return {
    data,
    error,
    route,
  }
}
