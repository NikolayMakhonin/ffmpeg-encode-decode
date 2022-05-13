import {parentPort, TransferListItem} from 'worker_threads'
import {FFmpegTransformArgs} from '../ffmpeg/contracts'
import {IWorkerEventBus} from './contracts'
import {createWorkerEvent} from './createWorkerEvent'

type PromiseOrValue<T> = Promise<T> | T

export type WorkerFunction = (...args: any[]) => PromiseOrValue<[
  result: any,
  transferList?: ReadonlyArray<TransferListItem>
]>

export type WorkerFunctions = {
  [key in string]: WorkerFunction
}

export type FunctionRequest = {
  func: string,
  args: FFmpegTransformArgs
}

export function subscribeWorkerFunctions({
  eventBus,
  funcs,
}: {
  eventBus: IWorkerEventBus<any, FunctionRequest>,
  funcs: WorkerFunctions,
}) {
  return eventBus.subscribe(async (event) => {
    if (event.error) {
      console.error(event.error)
      eventBus.emit(createWorkerEvent(void 0, event.error, void 0, event.route))
      return
    }

    try {
      const func = funcs[event.data.func]
      if (!func) {
        eventBus.emit(createWorkerEvent(
          void 0,
          new Error('Unknown func: ' + event.data.func),
          void 0,
          event.route,
        ))
      }
      const [result, transferList] = (await func.apply(null, event.data.args)) || []
      parentPort.postMessage(createWorkerEvent(
        result,
        void 0,
        transferList,
        event.route,
      ), transferList)
    } catch (error) {
      eventBus.emit(createWorkerEvent(void 0, error, void 0, event.route))
    }
  })
}
