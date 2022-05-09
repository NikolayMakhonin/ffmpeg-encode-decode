import {CreateFFmpegOptions} from '@flemist/ffmpeg.wasm-st'
import {WorkerClient} from './WorkerClient'
import {Worker} from 'worker_threads'
import {FFmpegTransformArgs} from './contracts'

export class FFmpegTransformWorkerClient {
  options?: CreateFFmpegOptions
  private readonly _workerFilePath: string
  private _workerClient: WorkerClient = null

  constructor(workerFilePath: string, options?: CreateFFmpegOptions) {
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
        if (response.type === 'logger') {
          this.options.logger(response.value)
        }
      })
      this._workerClient = new WorkerClient({
        worker,
        responseFilter(response, err, requestId) {
          return response.type === 'ffmpegTransform'
        },
        getResponseValue(response) {
          if (response.value instanceof Error) {
            throw response.value
          }
          return response.value
        },
        createRequest(value, requestId) {
          return value
        },
      })
    }

    return this._workerClient
  }

  private _runCount: number = 0
  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<Uint8Array> {
    try {
      this._runCount++
      const result = await this.getWorkerClient().request<Uint8Array>(args)
      return result
    } finally {
      if (this._runCount >= 15000) {
        await this._workerClient.worker.terminate()
        this._workerClient = null
        this._runCount = 0
        console.log(`Unload ffmpegTransform worker after ${this._runCount} calls`)
      }
    }
  }
}
