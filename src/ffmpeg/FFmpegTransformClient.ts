import {
  FFmpegClientOptions,
  FFmpegInitEvent,
  FFmpegInitOptions,
  FFmpegTransformArgs,
  IFFmpegTransformClient,
} from './contracts'
import {
  IWorkerEventBus,
  WorkerData,
  WorkerFunctionClient,
  workerFunctionClient,
  WorkerFunctionClientEventBus,
} from '@flemist/worker-server'
import {CreateFFmpegOptions} from '@flemist/ffmpeg.wasm-st'
import {ffmpegTransformWorkerPath} from './paths.cjs'
import {WorkerClient} from 'src/ffmpeg/WorkerClient'

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

export class FFmpegTransformClient
  extends WorkerClient<FFmpegClientOptions>
  implements IFFmpegTransformClient {

  private _runCount: number = 0
  private _ffmpegInit: WorkerFunctionClient<FFmpegInitOptions, void, FFmpegInitEvent>
  private _ffmpegTransform: WorkerFunctionClient<FFmpegTransformArgs, Uint8Array, void>

  constructor({
    preInit,
    options,
  }: {
    preInit: boolean,
    options?: FFmpegClientOptions,
  }) {
    super({
      workerFilePath: ffmpegTransformWorkerPath,
      options       : options || {},
      preInit,
    })
  }

  protected async _init(workerEventBus: IWorkerEventBus) {
    this._ffmpegInit = getWorkerFFmpegInit(workerEventBus)
    this._ffmpegTransform = getWorkerFFmpegTransform(workerEventBus)
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

  async ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>> {
    await this.init()
    try {
      this._runCount++
      const result = await this._ffmpegTransform({
        data        : args,
        transferList: args[0].buffer instanceof SharedArrayBuffer
          ? null
          : [args[0].buffer],
      })
      return result
    }
    finally {
      if (this._runCount >= 15000) { // default: 15000, maximum 27054 according to stress test
        const runCount = this._runCount
        await this.terminate()
        await this.init()
        console.log(`Unload ffmpegTransform worker after ${runCount} calls`)
      }
    }
  }

  protected _terminate() {
    this._runCount = 0
    this._ffmpegInit = null
    this._ffmpegTransform = null
  }
}
