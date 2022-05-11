import {IUnsubscribe, IWorkerEventBus} from '../worker-event-bus/contracts'
import {FFmpegOptions} from './contracts'
import {TransferListItem, Worker} from 'worker_threads'
import {WorkerExitError} from '../worker-event-bus/workerExitError'
import {workerToEventBus} from '../worker-event-bus/workerToEventBus'

export class FFmpegTransformWorker implements IWorkerEventBus {
  private readonly _options?: FFmpegOptions
  private readonly _workerFilePath: string

  constructor({
    workerFilePath,
    options,
  }: {
    workerFilePath: string,
    options?: FFmpegOptions,
  }) {
    this._workerFilePath = workerFilePath
    this._options = options
  }

  private _error: Error

  private assert() {
    if (this._error) {
      throw this._error
    }
  }

  private _worker: Worker

  private getWorker() {
    if (!this._worker) {
      this._worker = new Worker(this._workerFilePath, {
        workerData: {
          options: {
            ...this._options || {},
            logger: !!this._options.logger,
          },
        },
      })
      this._worker.on('exit', code => {
        this._worker = null
        this._workerEventBus = null
        if (code !== 0) {
          this._error = new WorkerExitError(code)
        }
      })
    }
    return this._worker
  }

  private _workerEventBus: IWorkerEventBus

  private getWorkerEventBus() {
    if (!this._workerEventBus) {
      const worker = this.getWorker()
      this._workerEventBus = workerToEventBus(worker)
    }
    return this._workerEventBus
  }

  emit(data: any, transferList?: ReadonlyArray<TransferListItem>) {
    this.assert()
    this.getWorkerEventBus().emit(data, transferList)
  }

  subscribe(callback: (data: any, error?: Error) => void): IUnsubscribe {
    this.assert()
    return this.getWorkerEventBus().subscribe(callback)
  }

  async terminate() {
    if (this._worker) {
      await this._worker.terminate()
    }
  }
}
