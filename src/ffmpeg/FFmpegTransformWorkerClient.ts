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
      this._workerClient = new WorkerClient({
        worker,
        responseFilter(response, err, requestId) {
          return true
        },
        getResponseValue(response) {
          if (response instanceof Error) {
            throw response
          }
          return response
        },
        createRequest(value, requestId) {
          return value
        },
      })
    }

    return this._workerClient
  }

  private _isRunning: boolean = false

  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<Uint8Array> {
    if (this._isRunning) {
      throw new Error('ffmpegTransform is running')
    }
    this._isRunning = true
    try {
      const result = await this.getWorkerClient().request<Uint8Array>(args)
      return result
    } finally {
      this._isRunning = false
    }
  }
}
