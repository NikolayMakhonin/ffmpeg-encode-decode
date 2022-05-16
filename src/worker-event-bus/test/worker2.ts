import {parentPort, workerData} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../event-bus/messagePortToEventBus'
import {workerFunctionClient} from '../function/workerFunctionClient'
import {TestFuncArgs} from './contracts'
import {WorkerData} from '../common/contracts'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus(func1Port)

const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: func1EventBus,
  name    : 'func1',
})

function func2(
  data: WorkerData<TestFuncArgs>,
): WorkerFunctionServerResult<Float32Array> {
  data.data.value[1]++
  if (data.data.async) {
    return (async () => {
      const result = await func1(data)
      return result
    })()
  }
  if (data.data.error) {
    throw new Error('func2')
  }
  return {
    data        : data.data.value,
    transferList: data.transferList,
  }
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  func    : func2,
})
