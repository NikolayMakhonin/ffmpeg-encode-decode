import {parentPort, Worker, workerData} from 'worker_threads'
import {messagePortToEventBus} from '../messagePortToEventBus'
import path from 'path'
import {workerToEventBus} from '../workerToEventBus'
import {eventBusConnect} from '../eventBusConnect'
import {eventBusToMessagePort} from '../eventBusToMessagePort'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus(func1Port)

let func1PortForward = eventBusToMessagePort(func1EventBus)
const worker2 = new Worker(
  path.resolve('./dist/worker-event-bus/test/worker2.cjs'),
  {
    workerData  : {func1Port: func1PortForward},
    transferList: [func1PortForward],
  },
)
const worker2EventBus = workerToEventBus(worker2)

// func1PortForward = eventBusToMessagePort(func1EventBus)
// const worker3 = new Worker(
//   path.resolve('./dist/worker-event-bus/test/worker3.cjs'),
//   {
//     workerData  : {func1Port: func1PortForward},
//     transferList: [func1PortForward],
//   },
// )
// const worker3EventBus = workerToEventBus(worker3)

const parentEventBus = messagePortToEventBus(parentPort)
// eventBusConnect(worker3EventBus, parentEventBus)
eventBusConnect(worker2EventBus, parentEventBus)
