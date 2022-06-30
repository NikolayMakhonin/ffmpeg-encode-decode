import {FFmpegTransformArgs, IFFmpegTransformClient} from './contracts'

export function getFFmpegTransform(client: IFFmpegTransformClient) {
  return async function ffmpegTransform(...args: FFmpegTransformArgs): Promise<Uint8Array> {
    const result = await client.ffmpegTransform(...args)
    return result.data
  }
}
