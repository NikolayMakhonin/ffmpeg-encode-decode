import {Callback, IUnsubscribeAsync, IWorkerEventBus, WorkerData, WorkerFunc} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'
import {AbortFunc, FunctionRequest, SubscribeRequest} from './contracts'
import {AbortController, AbortSignal} from '../../abort-controller/AbortController'
import {TransferListItem} from 'worker_threads'

export type PromiseOrValue<T> = Promise<T> | T

export type WorkerFunctionServer<TRequest = any, TResult = any, TError = any>
  = (data: WorkerData<TRequest>, callback: Callback<WorkerData<any>, TError>)
  => PromiseOrValue<WorkerData<TResult>>

function _workerFunctionServer<TRequest = any, TResult = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResult, FunctionRequest<TRequest>>,
  func: WorkerFunctionServer<TRequest, TResult>,
  name?: string,
}) {
  return eventBus.subscribe(async (event) => {
    function emit(data: WorkerData<any>, error?: Error) {
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

export type TaskFunc<TRequest, TResult, TCallbackData> = (
  request: TRequest,
  abortSignal: AbortSignal,
  callback: (data: TCallbackData) => void,
) => PromiseOrValue<TResult>

export type WorkerData<TData = any> = {
  data?: TData
  transferList?: ReadonlyArray<TransferListItem>
}

export type WorkerTaskFunc<TRequest, TResult, TCallbackData>
  = TaskFunc<WorkerData<TRequest>, WorkerData<TCallbackData>, WorkerData<TResult>>

export type WorkerTaskFuncResult<TResult> = PromiseOrValue<WorkerData<TResult>>

export function workerFunctionServer<TRequest = any, TResult = any, TCallbackData = any>({
  eventBus,
  func,
  name,
}: {
  eventBus: IWorkerEventBus<TResult, FunctionRequest<SubscribeRequest<TRequest>>>,
  func: WorkerTaskFunc<TRequest, TCallbackData, TResult>,
  name?: string,
}) {
  const abortMap = new Map<string, AbortFunc>()

  _workerFunctionServer<SubscribeRequest<TRequest>, TResult>({
    eventBus,
    async func(data, callback) {
      switch (data.data.type) {
        case 'call': {
          let promiseOrValue: PromiseOrValue<WorkerData<TResult>>
          try {
            const abortController = new AbortController()
            abortMap.set(data.data.requestId, function abort(reason: any) {
              abortController.abort(reason)
            })

            promiseOrValue = func(
              {
                data        : data.data.data,
                transferList: data.transferList,
              },
              abortController.signal,
              (_data) => {
                callback(_data)
              },
            )
          } finally {
            abortMap.delete(data.data.requestId)
          }

          if (promiseOrValue && typeof (promiseOrValue as Promise<any>).then === 'function') {
            callback({
              data: {
                requestId,
                type: 'started',
              },
            })

            ;(async () => {
              try {
                const result = await promiseOrValue
                callback({
                  data: {
                    requestId,
                    type: 'completed',
                    result,
                  },
                })
              } catch (err) {
                callback(void 0, err)
              }
            })()
          } else {
            callback({
              data: {
                requestId,
                type  : 'completed',
                result: promiseOrValue,
              },
            })
          }

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
        default:
          throw new Error('Unknown FunctionRequestType: ' + (data.data as any).type)
      }

      return null
    },
    name,
  })
}
