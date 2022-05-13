import {parentPort} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../messagePortToEventBus'

function func1(value: Float32Array, async: boolean, error: boolean): WorkerFunctionServerResult<Float32Array> {
  value[0]++
  if (error) {
    throw new Error('func1')
  }
  const result: WorkerFunctionServerResult<Float32Array> = [value, [value.buffer]]
  return async
    ? Promise.resolve(result)
    : result
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  func    : func1,
})
