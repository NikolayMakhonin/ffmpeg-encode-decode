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
          abortMap.set(requestId, function abort(reason: any) {
            abortController.abort(reason)
          })

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

          abortMap.delete(requestId)

          if (typeof result !== 'function') {
            emit(result, void 0)
          } else {
            const unsubscribe = result
            unsubscribeMap.set(requestId, unsubscribe)
            emit(void 0)
          }

          break
        }
        case 'abort': {
          const abort = abortMap.get(requestId)
          if (abort) {
            abortMap.delete(requestId)
            abort(event.data.data.data)
          }
          emit({})
          break
        }
        case 'unsubscribe': {
          const unsubscribeAbortController = new AbortController()
          abortUnsubscribeMap.set(requestId, function abortUnsubscribe(reason: any) {
            unsubscribeAbortController.abort(reason)
          })

          const unsubscribe = unsubscribeMap.get(requestId)
          if (unsubscribe) {
            unsubscribeMap.delete(requestId)
            await unsubscribe(unsubscribeAbortController.signal)
          }
          emit({})
          break
        }
        case 'abortUnsubscribe': {
          const abortUnsubscribe = abortUnsubscribeMap.get(requestId)
          if (abortUnsubscribe) {
            abortUnsubscribeMap.delete(requestId)
            abortUnsubscribe(event.data.data.data)
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
