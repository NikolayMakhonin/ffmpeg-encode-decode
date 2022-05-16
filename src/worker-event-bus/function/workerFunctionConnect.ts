import {IUnsubscribe, IWorkerEventBus} from '../common/contracts'
import {workerFunctionServer} from './workerFunctionServer'
import {workerFunctionClient} from './workerFunctionClient'
import {FunctionRequest} from './contracts'

export function workerFunctionConnect<TRequestData = any, TResponseData = any>(
  name: string,
  eventBusServer: IWorkerEventBus<FunctionRequest<TRequestData>, TResponseData>,
  eventBusClient: IWorkerEventBus<TResponseData, FunctionRequest<TRequestData>>,
): IUnsubscribe {
  return workerFunctionServer<TRequestData, TResponseData>({
    eventBus: eventBusClient,
    func    : workerFunctionClient({
      eventBus: eventBusServer,
      name,
    }),
    name,
  })
}
