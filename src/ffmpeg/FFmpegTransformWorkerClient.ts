import {Worker} from 'worker_threads'
import {FFmpegOptions, FFmpegTransformArgs} from './contracts'
import {IWorkerEventBus} from '../worker-event-bus/contracts'
import {workerToEventBus} from '../worker-event-bus/workerToEventBus'
import {workerRequest} from '../worker-event-bus/workerRequest'

export class FFmpegTransformWorkerClient {
  options?: FFmpegOptions
  private readonly _workerFilePath: string
  private _workerEventBus: IWorkerEventBus = null

  constructor(workerFilePath: string, options?: FFmpegOptions) {
    this._workerFilePath = workerFilePath
    this.options = options
  }

  private getWorkerEventBus() {
    if (!this._workerEventBus) {
      const worker = new Worker(this._workerFilePath, {
        workerData: {
          options: {
            ...this.options || {},
            logger: !!this.options.logger,
          },
        },
      })
      this._workerEventBus = workerToEventBus(worker)
      this._workerEventBus.subscribe((response) => {
        if (response && response.callbackId === 'logger') {
          this.options.logger(response.value)
        }
      })
    }

    return this._workerEventBus
  }

  async load(): Promise<void> {
    await this.getWorkerEventBus().emit({
      method: 'load',
    })
  }

  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<Uint8Array> {
    try {
      this._runCount++
      const result = await workerRequest({
        eventBus: this.getWorkerEventBus(),
        data    : {
          method: 'ffmpegTransform',
          args,
        },
        transferList: args[0].buffer instanceof SharedArrayBuffer
          ? null
          : [args[0].buffer],
        config: {
          responseFilter(response, requestId) {
            return response?.requestId === requestId
          },
          getResponseData(response) {
            if (response.error) {
              throw response.error
            }
            return response.value
          },
          createRequest(value, requestId) {
            return {
              requestId,
              value,
            }
          },
        },
      })
      return result
    } finally {
      if (this._runCount >= 15000) {
        const runCount = this._runCount
        await this.terminate()
        this.getWorkerEventBus()
        console.log(`Unload ffmpegTransform worker after ${runCount} calls`)
      }
    }
  }

  async terminate() {
    await this._workerEventBus.worker?.terminate()
    this._workerEventBus = null
    this._runCount = 0
  }
}
