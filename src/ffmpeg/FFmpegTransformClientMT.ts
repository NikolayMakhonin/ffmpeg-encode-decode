import {FFmpegOptions, FFmpegTransformArgs, IFFmpegTransformClient} from './contracts'
import {FFmpegTransformClient} from './FFmpegTransformClient'
import {WorkerData} from '@flemist/worker-server'
import {
  IObjectPool,
  ObjectPool,
} from '@flemist/async-utils'

export class FFmpegTransformClientMT implements IFFmpegTransformClient {
  private readonly _workerFilePath: string
  options?: FFmpegOptions
  private readonly _clientPool: IObjectPool<IFFmpegTransformClient>
  constructor(workerFilePath: string, options?: FFmpegOptions & { threads: number }) {
    this._workerFilePath = workerFilePath
    this.options = options || {}
    this._clientPool = new ObjectPool<IFFmpegTransformClient>({
      maxSize    : options.threads || 1,
      holdObjects: true,
      create     : () => {
        return this._createClient()
      },
      destroy: (client) => {
        return client.terminate()
      },
    })
    if (this.options.preload) {
      void this._clientPool.allocate()
    }
  }

  private _createClient(): FFmpegTransformClient {
    return new FFmpegTransformClient(this._workerFilePath, this.options)
  }

  ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>> {
    return this._clientPool.use(
      (client) => {
        return client.ffmpegTransform(...args)
      },
    )
  }

  async terminate(): Promise<void> {
    const promises: Promise<void>[] = []
    this._clientPool.availableObjects.forEach(o => {
      promises.push(o.terminate())
    })
    this._clientPool.holdObjects.forEach(o => {
      promises.push(o.terminate())
    })
    await Promise.all(promises)
  }
}
