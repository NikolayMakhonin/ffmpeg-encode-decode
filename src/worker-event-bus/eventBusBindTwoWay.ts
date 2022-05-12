import {IUnsubscribe, IWorkerEventBus} from './contracts'
import {eventBusBindOneWay} from './eventBusBindOneWay'

export function eventBusBindTwoWay<TData = any>(
  eventBus1: IWorkerEventBus<TData>,
  eventBus2: IWorkerEventBus<TData>,
): IUnsubscribe {
  let unsubscribe1
  let unsubscribe2
  function unsubscribe() {
    if (unsubscribe1) {
      unsubscribe1()
    }
    if (unsubscribe2) {
      unsubscribe2()
    }
  }

  try {
    unsubscribe1 = eventBusBindOneWay(eventBus1, eventBus2)
    unsubscribe2 = eventBusBindOneWay(eventBus2, eventBus1)
  } catch (err) {
    unsubscribe()
    throw err
  }

  return unsubscribe
}
