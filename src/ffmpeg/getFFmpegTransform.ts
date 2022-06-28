import {FFmpegTransformArgs} from './contracts'
import path from 'path'
import {Worker} from 'worker_threads'
import {
  workerToEventBus,
  workerFunctionClient,
  WorkerFunctionClientEventBus,
} from '@flemist/worker-server'

export function createFFmpegTransformWorker(

): WorkerFunctionClientEventBus<FFmpegTransformArgs, Uint8Array, never> {
  const worker = new Worker(path.resolve('./dist/ffmpeg/test/ffmpegTransformWorker.cjs'))
  const workerEventBus = workerToEventBus(worker)
  return workerEventBus
}

export function getFFmpegLoad(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegTransformArgs, Uint8Array, never>,
) {
  return workerFunctionClient<FFmpegTransformArgs, Uint8Array, never>({
    eventBus: workerEventBus,
    name    : 'ffmpegLoad',
  })
}

export function getFFmpegTransform(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegTransformArgs, Uint8Array, never>,
) {
  return workerFunctionClient<FFmpegTransformArgs, Uint8Array, never>({
    eventBus: workerEventBus,
    name    : 'ffmpegTransform',
  })
}
