import {WorkerClient} from './WorkerClient'
import {Worker} from 'worker_threads'
import {FFmpegOptions, FFmpegTransformArgs} from './contracts'

export class FFmpegTransformWorkerClient {
  options?: FFmpegOptions
  private readonly _workerFilePath: string
  private _workerClient: WorkerClient = null

  constructor(workerFilePath: string, options?: FFmpegOptions) {
    this._workerFilePath = workerFilePath
    this.options = options
  }

  private getWorkerClient() {
    if (!this._workerClient) {
      const worker = new Worker(this._workerFilePath, {
        workerData: {
          options: {
            ...this.options || {},
            logger: !!this.options.logger,
          },
        },
      })
      worker.on('message', (response) => {
        if (response.callbackId === 'logger') {
          this.options.logger(response.value)
        }
      })
      this._workerClient = new WorkerClient({
        worker,
        responseFilter(response, requestId) {
          return response?.requestId === requestId
        },
        getResponseValue(response) {
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
      })
    }

    return this._workerClient
  }

  async load(): Promise<void> {
    await this.getWorkerClient().request({
      method: 'load',
    })
  }

  private _runCount: number = 0
  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<Uint8Array> {
    try {
      this._runCount++
      const result = await this.getWorkerClient().request<Uint8Array>(
        {
          method: 'ffmpegTransform',
          args,
        },
        args[0].buffer instanceof SharedArrayBuffer
          ? null
          : [args[0].buffer],
      )
      return result
    } finally {
      if (this._runCount >= 15000) {
        const runCount = this._runCount
        await this.terminate()
        this.getWorkerClient()
        console.log(`Unload ffmpegTransform worker after ${runCount} calls`)
      }
    }
  }

  async terminate() {
    await this._workerClient.worker?.terminate()
    this._workerClient = null
    this._runCount = 0
  }
}
