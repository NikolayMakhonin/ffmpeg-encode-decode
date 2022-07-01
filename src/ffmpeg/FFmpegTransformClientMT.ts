import {FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient} from './contracts'
import {WorkerClientMT, WorkerData} from '@flemist/worker-server'
import {FFmpegTransformClient} from './FFmpegTransformClient'

export class FFmpegTransformClientMT
  extends WorkerClientMT<FFmpegClientOptions, FFmpegTransformClient>
  implements IFFmpegTransformClient {

  constructor({
    threads,
    preInit,
    options,
  }: {
    threads: number,
    preInit?: boolean,
    options?: FFmpegClientOptions,
  }) {
    super({
      threads,
      createClient(options) {
        return new FFmpegTransformClient({
          preInit,
          options: this.options,
        })
      },
      options: options || {},
      preInit,
    })
  }

  ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>> {
    return this.use((client) => {
      return client.ffmpegTransform(...args)
    })
  }
}
