import {parentPort} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../messagePortToEventBus'
import {WorkerData} from '../contracts'
import {TestFuncArgs} from './contracts'

function func1(
  data: WorkerData<TestFuncArgs>,
): WorkerFunctionServerResult<Float32Array> {
  data.data.value[0]++
  if (data.data.error) {
    throw new Error('func1')
  }
  const result: WorkerData<Float32Array> = {
    data        : data.data.value,
    transferList: data.transferList,
  }
  return data.data.async
    ? Promise.resolve(result)
    : result
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  func    : func1,
})
