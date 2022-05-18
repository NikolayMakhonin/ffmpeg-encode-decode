import {parentPort} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../event-bus/messagePortToEventBus'
import {WorkerData} from '../common/contracts'
import {TestFuncArgs} from './contracts'
import {createTestFuncResult} from './helpers'
import {delay} from '../../test/delay'

function func1(
  data: WorkerData<TestFuncArgs>,
  abortSignal: AbortSignal,
  callback: (data: WorkerData<any>) => void,
): WorkerFunctionServerResult<Float32Array> {
  callback(createTestFuncResult(data.data.value.slice()))
  data.data.value[0]++
  callback(createTestFuncResult(data.data.value.slice()))
  if (data.data.error) {
    throw new Error('func1')
  }
  if (data.data.async) {
    return (async () => {
      await delay(100)
      if (abortSignal.aborted) {
        throw new Error('abort')
        // throw (abortSignal as any).reason // TODO
      }
      data.data.value[0]++
      const result = createTestFuncResult(data.data.value)
      return result
    })()
  }

  data.data.value[0]++
  const result = createTestFuncResult(data.data.value)
  return result
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : func1,
})
