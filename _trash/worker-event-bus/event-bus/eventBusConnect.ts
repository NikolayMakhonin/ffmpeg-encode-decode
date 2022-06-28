import {IUnsubscribe, IWorkerEventBus, WorkerData} from '../common/contracts'
import {getNextId} from '../common/getNextId'
import {routePop, routePush} from '../common/route'

export function eventBusConnect<TRequestData = any, TResponseData = any>({
  server,
  client,
  requestFilter,
}: {
  server: IWorkerEventBus<TRequestData, TResponseData>,
  client: IWorkerEventBus<TResponseData, TRequestData>,
  requestFilter: (event: WorkerData<TRequestData>) => boolean,
}): IUnsubscribe {
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
    unsubscribeServer = server.subscribe((event) => {
      try {
        if (!routePop(event.route, connectionId)) {
          return
        }
        client.emit(event)
      } catch (err) {
        console.error(err)
        return
      }
    })
    unsubscribeClient = client.subscribe((event) => {
      if (!requestFilter(event.data)) {
        return
      }
      routePush(event.route, connectionId)
      server.emit(event)
    })
  } catch (err) {
    unsubscribe()
    throw err
  }

  return unsubscribe
}
