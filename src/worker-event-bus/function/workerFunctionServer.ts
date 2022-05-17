import {Callback, IUnsubscribeAsync, IWorkerEventBus, WorkerData, WorkerFunc} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'
import {AbortFunc, FunctionRequest, SubscribeRequest} from './contracts'
import {AbortController} from '../../abort-controller/AbortController'

type PromiseOrValue<T> = Promise<T> | T
// interface IPromiseOrValue<T> extends Promise<PromiseOrValue<T>> { }

export type WorkerFunctionServerResult<TData> = PromiseOrValue<WorkerData<TData>>

export type WorkerFunctionServer<TRequestData = any, TResponseData = any>
  = (data: WorkerData<TRequestData>, callback: Callback<WorkerData<TResponseData>, Error>)
    => WorkerFunctionServerResult<TResponseData>

function _workerFunctionServer<TRequestData = any, TResponseData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResponseData, FunctionRequest<TRequestData>>,
  func: WorkerFunctionServer<TRequestData, TResponseData>,
  name?: string,
}) {
  return eventBus.subscribe(async (event) => {
    function emit(data: WorkerData<TResponseData>, error?: Error) {
      eventBus.emit(createWorkerEvent(
        error ? data : data || {},
        error,
        event.route,
      ))
    }

    if (event.error) {
      console.error(event.error)
      emit(void 0, event.error)
      return
    }

    if (!name) {
      name = func.name
    }

    if (event.data.data.func !== name) {
      return
    }
    if (!func) {
      emit(void 0, new Error('Unknown func: ' + event.data.data.func))
    }

    try {
      const data = await func({
        data        : event.data.data.data,
        transferList: event.data.transferList,
      }, emit)
      emit(data)
    } catch (error) {
      emit(void 0, error)
    }
  })
}

export function workerFunctionServer<TRequestData = any, TResponseData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResponseData, FunctionRequest<SubscribeRequest<TRequestData>>>,
  func: WorkerFunc<TRequestData, TResponseData>,
  name?: string,
}) {
  const abortMap = new Map<string, AbortFunc>()
  const unsubscribeMap = new Map<string, IUnsubscribeAsync>()
  const abortUnsubscribeMap = new Map<string, AbortFunc>()

  _workerFunctionServer<SubscribeRequest<TRequestData>, TResponseData>({
    eventBus,
    async func(data, callback) {
      switch (data.data.type) {
        case 'call': {
          const abortController = new AbortController()
          abortMap.set(data.data.requestId, function abort(reason: any) {
            abortController.abort(reason)
          })

          const result = await func(
            {
              data: data.data.data,
              transferList: data.transferList,
            },
            abortController.signal,
            callback,
          )

          abortMap.delete(data.data.requestId)

          if (typeof result !== 'function') {
            return result
          }

          const unsubscribe = result
          unsubscribeMap.set(data.data.requestId, unsubscribe)

          break
        }
        case 'abort': {
          const abort = abortMap.get(data.data.requestId)
          if (abort) {
            abortMap.delete(data.data.requestId)
            abort(data.data.data)
          }
          break
        }
        case 'unsubscribe': {
          const unsubscribeAbortController = new AbortController()
          abortUnsubscribeMap.set(data.data.requestId, function abortUnsubscribe(reason: any) {
            unsubscribeAbortController.abort(reason)
          })

          const unsubscribe = unsubscribeMap.get(data.data.requestId)
          if (unsubscribe) {
            unsubscribeMap.delete(data.data.requestId)
            await unsubscribe(unsubscribeAbortController.signal)
          }
          break
        }
        case 'abortUnsubscribe': {
          const abortUnsubscribe = abortUnsubscribeMap.get(data.data.requestId)
          if (abortUnsubscribe) {
            abortUnsubscribeMap.delete(data.data.requestId)
            abortUnsubscribe(data.data.data)
          }
          break
        }
        default:
          throw new Error('Unknown FunctionRequestType: ' + (data.data as any).type)
      }

      return null
    },
    name,
  })
}
