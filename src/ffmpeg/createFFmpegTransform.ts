import {FFmpegTransformWorkerClient} from './FFmpegTransformWorkerClient'
import {FFmpegTransformArgs} from './contracts'

export function createFFmpegTransform(options?: any) {
  const client = new FFmpegTransformWorkerClient('', options)
  return function ffmpegTransform(...args: FFmpegTransformArgs) {
    return client.ffmpegTransform(...args)
  }
}
