import {MessagePort, MessageChannel} from 'worker_threads'
import {IWorkerEventBus, WorkerData} from '../common/contracts'
import {messagePortToEventBus} from './messagePortToEventBus'
import {eventBusConnect} from './eventBusConnect'

export function eventBusToMessagePort<TRequestData = any>({
  server,
  requestFilter,
}: {
  server: IWorkerEventBus<TRequestData>,
  requestFilter: (data: WorkerData<TRequestData>) => boolean,
}): MessagePort {
  const channel = new MessageChannel()
  const client = messagePortToEventBus(channel.port1)
  eventBusConnect({
    server,
    client,
    requestFilter,
  })
  return channel.port2
}
