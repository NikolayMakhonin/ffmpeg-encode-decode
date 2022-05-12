import {IUnsubscribe, IWorkerEventBus} from './contracts'

export function eventBusBindOneWay<TData = any>(
  eventBusFrom: IWorkerEventBus<TData>,
  eventBusTo: IWorkerEventBus<TData>,
): IUnsubscribe {
  return eventBusFrom.subscribe((event) => {
    eventBusTo.emit(event)
  })
}
