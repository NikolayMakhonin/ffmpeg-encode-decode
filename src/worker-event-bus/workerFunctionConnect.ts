import {IUnsubscribe, IWorkerEventBus} from './contracts'
import {workerFunctionServer} from './function/workerFunctionServer'
import {workerFunctionClient} from './function/workerFunctionClient'
import {FunctionRequest} from './function/contracts'

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
