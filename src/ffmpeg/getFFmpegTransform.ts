import {FFmpegTransformWorkerClient} from './FFmpegTransformWorkerClient'
import {FFmpegOptions, FFmpegTransformArgs} from './contracts'
import path from 'path'

export function createFFmpegTransformClient(options?: FFmpegOptions) {
  const client = new FFmpegTransformWorkerClient(
    path.resolve('./dist/ffmpeg/ffmpegTransformWorker.cjs'),
    options,
  )
  return client
}

export function getFFmpegTransform(client: FFmpegTransformWorkerClient) {
  return function ffmpegTransform(...args: FFmpegTransformArgs) {
    return client.ffmpegTransform(...args)
  }
}
