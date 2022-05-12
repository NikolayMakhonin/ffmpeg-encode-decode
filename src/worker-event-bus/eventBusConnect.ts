import {IUnsubscribe, IWorkerEventBus} from './contracts'
import {getNextId} from './getNextId'
import {routePop, routePush} from './route'

export function eventBusConnect<TData = any>(
  eventBusServer: IWorkerEventBus<TData>,
  eventBusClient: IWorkerEventBus<TData>,
): IUnsubscribe {
  const connectionId = getNextId()

  let unsubscribeServer
  let unsubscribeClient
  function unsubscribe() {
    if (unsubscribeServer) {
      unsubscribeServer()
    }
    if (unsubscribeClient) {
      unsubscribeClient()
    }
  }

  try {
    unsubscribeServer = eventBusServer.subscribe((event) => {
      try {
        if (!routePop(event.route, connectionId)) {
          return
        }
        eventBusClient.emit(event)
      } catch (err) {
        console.error(err)
        return
      }
    })
    unsubscribeClient = eventBusClient.subscribe((event) => {
      routePush(event.route, connectionId)
      eventBusServer.emit(event)
    })
  } catch (err) {
    unsubscribe()
    throw err
  }

  return unsubscribe
}
