import {Worker} from 'worker_threads'
import {IWorkerEventBus, workerToEventBus} from '@flemist/worker-server'
import path from 'path'
import {IWorkerClient} from './contracts'

export abstract class WorkerClient<TOptions> implements IWorkerClient {
  protected readonly _workerFilePath: string
  options: TOptions
  private _worker: Worker = null
  private _workerEventBus: IWorkerEventBus = null

  protected constructor({
    workerFilePath,
    preInit,
    options,
  }: {
    workerFilePath: string,
    preInit: boolean,
    options: TOptions,
  }) {
    this._workerFilePath = workerFilePath
    this.options = options
    if (preInit) {
      void this.init()
    }
  }

  private _initPromise: Promise<void>

  init() {
    if (!this._initPromise) {
      this._initPromise = Promise.resolve().then(() => this.__init())
    }
    return this._initPromise
  }

  private async __init() {
    this._worker = new Worker(path.resolve(this._workerFilePath))
    this._workerEventBus = workerToEventBus(this._worker)
    await this._init(this._workerEventBus)
  }

  protected abstract _init(workerEventBus: IWorkerEventBus): Promise<void>|void

  async terminate() {
    if (this._worker) {
      await this._worker?.terminate()
      this._worker = null
      this._workerEventBus = null
      this._initPromise = null
      await this._terminate()
    }
  }

  protected abstract _terminate(): Promise<void>|void
}
