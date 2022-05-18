import {parentPort, workerData} from 'worker_threads'
import {workerFunctionClient, workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../event-bus/messagePortToEventBus'
import {TestFuncArgs} from './contracts'
import {WorkerData} from '../common/contracts'
import {createTestFuncResult} from './helpers'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus(func1Port)

const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: func1EventBus,
  name    : 'func1',
})

function func2(
  data: WorkerData<TestFuncArgs>,
  abortSignal: AbortSignal,
  callback: (data: WorkerData<any>) => void,
): WorkerFunctionServerResult<Float32Array> {
  callback(createTestFuncResult(data.data.value.slice()))
  data.data.value[1]++
  callback(createTestFuncResult(data.data.value.slice()))
  if (data.data.async) {
    return (async () => {
      const result = await func1(data, abortSignal, callback)
      result.data[1]++
      return result
    })()
  }
  if (data.data.error) {
    throw new Error('func2')
  }
  data.data.value[1]++
  return createTestFuncResult(data.data.value)
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : func2,
})
