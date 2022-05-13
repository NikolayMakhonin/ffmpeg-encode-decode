import {parentPort, workerData} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../messagePortToEventBus'
import {workerFunctionClient} from '../function/workerFunctionClient'
import {TestFuncArgs} from './contracts'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus(func1Port)

const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: func1EventBus,
  name    : 'func1',
})

function func3(value: Float32Array, async: boolean, error: boolean): WorkerFunctionServerResult<Float32Array> {
  value[2]++
  if (async) {
    return (async () => {
      value = await func1([value, async, error], [value])
      return [value, [value.buffer]]
    })()
  }
  if (error) {
    throw new Error('func4')
  }
  return [value, [value.buffer]]
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  func    : func3,
})
