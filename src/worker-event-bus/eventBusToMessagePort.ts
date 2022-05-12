import {MessagePort, MessageChannel} from 'node:worker_threads'
import {IWorkerEventBus} from './contracts'
import {messagePortToEventBus} from './messagePortToEventBus'
import {eventBusBindTwoWay} from './eventBusBindTwoWay'

export function eventBusToMessagePort<TData = any>(eventBus: IWorkerEventBus<TData>): MessagePort {
  const channel = new MessageChannel()
  const eventBus1 = messagePortToEventBus(channel.port1)
  eventBusBindTwoWay(eventBus, eventBus1)
  return channel.port2
}
