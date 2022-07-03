import {FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient} from './contracts'
import {WorkerClientPool, WorkerData} from '@flemist/worker-server'
import {FFmpegTransformClient} from './FFmpegTransformClient'
import {IPool} from '@flemist/time-limits'

export class FFmpegTransformClientPool
  extends WorkerClientPool<FFmpegTransformClient>
  implements IFFmpegTransformClient {

  constructor({
    threadsPool,
    preInit,
    options,
  }: {
    threadsPool: IPool,
    preInit?: boolean,
    options?: FFmpegClientOptions,
  }) {
    super({
      threadsPool,
      createClient() {
        return new FFmpegTransformClient({
          preInit,
          options: options,
        })
      },
      preInit,
    })
  }

  ffmpegTransform(args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>> {
    return this.use(1, ([client]) => {
      return client.ffmpegTransform(args)
    }, args.priority, args.abortSignal)
  }
}
