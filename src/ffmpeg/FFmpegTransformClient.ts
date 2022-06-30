import {Worker} from 'worker_threads'
import {
  FFmpegInitEvent,
  FFmpegInitOptions,
  FFmpegOptions,
  FFmpegTransformArgs,
  IFFmpegTransformClient
} from './contracts'
import {
  IWorkerEventBus,
  WorkerData,
  WorkerFunctionClient,
  workerFunctionClient,
  WorkerFunctionClientEventBus,
  workerToEventBus,
} from '@flemist/worker-server'
import {CreateFFmpegOptions} from '@flemist/ffmpeg.wasm-st'
import path from 'path'

function getWorkerFFmpegInit(
  workerEventBus: WorkerFunctionClientEventBus<Omit<CreateFFmpegOptions, 'logger'>, void, FFmpegInitEvent>,
) {
  return workerFunctionClient<Omit<CreateFFmpegOptions, 'logger'>, void, FFmpegInitEvent>({
    eventBus: workerEventBus,
    name    : 'ffmpegInit',
  })
}

function getWorkerFFmpegTransform(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegTransformArgs, Uint8Array, void>,
) {
  return workerFunctionClient<FFmpegTransformArgs, Uint8Array, void>({
    eventBus: workerEventBus,
    name    : 'ffmpegTransform',
  })
}

export class FFmpegTransformClient implements IFFmpegTransformClient {
  private readonly _workerFilePath: string
  options?: FFmpegOptions
  private _worker: Worker = null
  private _workerEventBus: IWorkerEventBus = null
  private _ffmpegInit: WorkerFunctionClient<FFmpegInitOptions, void, FFmpegInitEvent>
  private _ffmpegTransform: WorkerFunctionClient<FFmpegTransformArgs, Uint8Array, void>

  constructor(workerFilePath: string, options?: FFmpegOptions) {
    this._workerFilePath = workerFilePath
    this.options = options || {}
    if (this.options.preload) {
      void this.init()
    }
  }

  _initPromise: Promise<void>
  private init() {
    if (!this._initPromise) {
      this._initPromise = this._init()
    }
    return this._initPromise
  }

  private async _init() {
    this._worker = new Worker(path.resolve(this._workerFilePath))
    this._workerEventBus = workerToEventBus(this._worker)

    this._ffmpegInit = getWorkerFFmpegInit(this._workerEventBus)
    this._ffmpegTransform = getWorkerFFmpegTransform(this._workerEventBus)

    const options = {
      ...this.options,
      logger: !!this.options.logger,
    }
    await this._ffmpegInit(
      {
        data: options,
      },
      null,
      (event) => {
        this.options.logger(event)
      },
    )
  }

  _runCount: number = 0

  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>> {
    await this.init()
    try {
      this._runCount++
      const result = await this._ffmpegTransform({
        data: args,
        transferList: args[0].buffer instanceof SharedArrayBuffer
          ? null
          : [args[0].buffer],
      })
      return result
    } finally {
      if (this._runCount >= 1000) { // TODO: 15000 // default: 15000, maximum 27054 according to stress test
        const runCount = this._runCount
        await this.terminate()
        await this.init()
        console.log(`Unload ffmpegTransform worker after ${runCount} calls`)
      }
    }
  }

  async terminate() {
    if (this._worker) {
      await this._worker?.terminate()
      this._worker = null
      this._workerEventBus = null
      this._runCount = 0
      this._initPromise = null
      this._ffmpegInit = null
      this._ffmpegTransform = null
    }
  }
}
