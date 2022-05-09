import {FFmpegTransformWorkerClient} from './FFmpegTransformWorkerClient'
import {FFmpegTransformArgs} from './contracts'
import path from 'path'

export function createFFmpegTransform(options?: any) {
  const client = new FFmpegTransformWorkerClient(
    path.resolve('./dist/ffmpeg/ffmpegTransformWorker.cjs'),
    options,
  )
  return function ffmpegTransform(...args: FFmpegTransformArgs) {
    return client.ffmpegTransform(...args)
  }
}
