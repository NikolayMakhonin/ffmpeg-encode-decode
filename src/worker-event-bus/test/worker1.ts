import {parentPort} from 'worker_threads'
import {subscribeWorkerFunctions, WorkerFunctionResult} from '../subscribeWorkerFunctions'
import {messagePortToEventBus} from '../messagePortToEventBus'

function testFunc(value: Float32Array, async: boolean, error: boolean): WorkerFunctionResult<Float32Array> {
  value[0]++
  if (error) {
    throw new Error('Test')
  }
  const result: WorkerFunctionResult<Float32Array> = [value, [value.buffer]]
  return async
    ? Promise.resolve(result)
    : result
}

subscribeWorkerFunctions({
  eventBus: messagePortToEventBus(parentPort),
  funcs   : {
    testFunc,
  },
})
