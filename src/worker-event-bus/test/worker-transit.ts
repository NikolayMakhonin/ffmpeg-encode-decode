import {parentPort, Worker, workerData} from 'worker_threads'
import {subscribeWorkerFunctions, WorkerFunctionResult} from '../subscribeWorkerFunctions'
import {messagePortToEventBus} from '../messagePortToEventBus'
import path from 'path'
import {workerToEventBus} from '../workerToEventBus'
import {eventBusConnect} from '../eventBusConnect'
import {eventBusToMessagePort} from '../eventBusToMessagePort'

const testFunc1EventBus = messagePortToEventBus(workerData.testFunc1Port)

let testFunc1Port = eventBusToMessagePort(testFunc1EventBus)
const worker2 = new Worker(
  path.resolve('./dist/worker-event-bus/test/worker2.js'),
  {
    workerData  : {testFunc1Port},
    transferList: [testFunc1Port],
  },
)

testFunc1Port = eventBusToMessagePort(testFunc1EventBus)
const worker3 = new Worker(
  path.resolve('./dist/worker-event-bus/test/worker3.js'),
  {
    workerData  : {testFunc1Port},
    transferList: [testFunc1Port],
  },
)
