import {parentPort, TransferListItem} from 'worker_threads'
import {
  IUnsubscribeAsync,
  IWorkerEventBus, WorkerData,
  WorkerFunc,
} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'
import {FunctionRequest} from './contracts'
import {AbortController} from '../../abort-controller/AbortController'

type AbortFunc = (reason: any) => void
const abortMap = new Map<string, AbortFunc>()
const unsubscribeMap = new Map<string, IUnsubscribeAsync>()
const abortUnsubscribeMap = new Map<string, AbortFunc>()

export function workerFunctionServer<TRequestData = any, TResponseData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResponseData, FunctionRequest<TRequestData>>,
  func: WorkerFunc<TRequestData, TResponseData>,
  name?: string,
}) {
  return eventBus.subscribe(async (event) => {
    if (event.error) {
      console.error(event.error)
      eventBus.emit(createWorkerEvent(void 0, event.error, event.route))
      return
    }

    if (!name) {
      name = func.name
    }

    function emit(data: WorkerData<any>, error?: Error) {
      eventBus.emit(createWorkerEvent(
        data,
        error,
        event.route,
      ))
    }

    if (event.data.data.func !== name) {
      return
    }
    if (!func) {
      emit(void 0, new Error('Unknown func: ' + event.data.data.func))
    }

    const requestId = event.route[0]

    try {
      switch (event.data.data.type) {
        case 'call': {
          const abortController = new AbortController()
          const abort = function abort(reason: any) {
            abortMap.delete(requestId)
            abortController.abort(reason)
          }
          abortMap.set(requestId, abort)

          const result = await func(
            {
              data        : event.data.data.data,
              transferList: event.data.transferList,
            },
            abortController.signal,
            (data, error) => {
              emit(data, error)
            },
          )

          if (typeof result !== 'function') {
            abortMap.delete(requestId)
            emit(result, void 0)
          } else {
            const unsubscribe = function unsubscribe(abortSignal: AbortSignal) {
              unsubscribeMap.delete(requestId)
              return result(abortSignal)
            }
            unsubscribeMap.set(requestId, unsubscribe)

            emit(void 0)
          }

          break
        }
        case 'abort': {
          const abort = abortMap.get(requestId)
          if (abort) {
            abort(event.data.data.data)
          }
          emit({})
          break
        }
        case 'abortUnsubscribe': {
          const abort = abortUnsubscribeMap.get(requestId)
          if (abort) {
            abort(event.data.data.data)
          }
          emit({})
          break
        }
        case 'unsubscribe': {
          const unsubscribeAbortController = new AbortController()
          const abortUnsubscribe = function abortUnsubscribe(reason: any) {
            abortUnsubscribeMap.delete(requestId)
            unsubscribeAbortController.abort(reason)
          }
          abortUnsubscribeMap.set(requestId, abortUnsubscribe)

          const unsubscribe = unsubscribeMap.get(requestId)
          if (unsubscribe) {
            await unsubscribe(unsubscribeAbortController.signal)
          }
          emit({})
          break
        }
        default:
          emit(void 0, new Error('Unknown FunctionRequestType: ' + event.data.data.type))
      }
    } catch (error) {
      abortMap.delete(requestId)
      unsubscribeMap.delete(requestId)
      abortUnsubscribeMap.delete(requestId)
      emit(void 0, error)
    }
  })
}
