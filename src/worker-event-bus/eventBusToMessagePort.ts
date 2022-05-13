import {MessagePort, MessageChannel} from 'worker_threads'
import {IWorkerEventBus} from './contracts'
import {messagePortToEventBus} from './messagePortToEventBus'
import {eventBusConnect} from './eventBusConnect'

export function eventBusToMessagePort<TData = any>(eventBusServer: IWorkerEventBus<TData>): MessagePort {
  const channel = new MessageChannel()
  const eventBusClient = messagePortToEventBus(channel.port1)
  eventBusConnect(eventBusServer, eventBusClient)
  return channel.port2
}
