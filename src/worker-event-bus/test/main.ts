import {workerFunctionClient} from '../function/workerFunctionClient'
import {Worker} from 'worker_threads'
import path from 'path'
import {workerToEventBus} from '../workerToEventBus'
import {eventBusToMessagePort} from '../eventBusToMessagePort'
import {TestFuncArgs} from './contracts'

const worker1 = new Worker(path.resolve('./dist/worker-event-bus/test/worker1.js'))
const worker1EventBus = workerToEventBus(worker1)

export const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: worker1EventBus,
  name    : 'func1',
})

let func1Port = eventBusToMessagePort(worker1EventBus)
const workerTransit = new Worker(
  path.resolve('./dist/worker-event-bus/test/worker-transit.js'),
  {
    workerData: {
      func1Port,
    },
    transferList: [func1Port],
  },
)

const workerTransitEventBus = workerToEventBus(workerTransit)

export const func2 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: workerTransitEventBus,
  name    : 'func2',
})

export const func3 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: workerTransitEventBus,
  name    : 'func3',
})
