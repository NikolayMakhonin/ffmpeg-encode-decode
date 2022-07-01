import {IObjectPool, ObjectPool} from '@flemist/async-utils'
import {IWorkerClient} from './contracts'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

export class WorkerClientMT<TOptions, TClient extends IWorkerClient>
implements IWorkerClient {

  options?: TOptions
  private readonly _clientPool: IObjectPool<TClient>
  private readonly _createClient: (options: TOptions) => Promise<TClient>|TClient

  protected constructor({
    createClient,
    threads,
    preInit,
    options,
  }: {
    createClient: (options: TOptions) => Promise<TClient> | TClient,
    threads: number,
    preInit: boolean,
    options: TOptions,
  }) {
    this.options = options
    this._createClient = createClient
    this._clientPool = new ObjectPool<TClient>({
      maxSize    : threads || 1,
      holdObjects: true,
      create     : () => {
        return this._createClient(this.options)
      },
      destroy: (client) => {
        return client.terminate()
      },
    })
    if (preInit) {
      void this.init()
    }
  }

  init() {
    return this._clientPool.allocate()
  }

  use<TResult>(
    func: (client: TClient, abortSignal?: IAbortSignalFast) => Promise<TResult> | TResult,
    abortSignal?: IAbortSignalFast,
  ): Promise<TResult> {
    return this._clientPool.use(func, abortSignal)
  }

  async terminate(): Promise<void> {
    const promises: Promise<void>[] = []
    this._clientPool.availableObjects.forEach(o => {
      promises.push(Promise.resolve().then(() => o.terminate()))
    })
    this._clientPool.holdObjects.forEach(o => {
      promises.push(Promise.resolve().then(() => o.terminate()))
    })
    await Promise.all(promises)
  }
}
