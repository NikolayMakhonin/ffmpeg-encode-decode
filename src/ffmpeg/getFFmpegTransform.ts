import {FFmpegOptions, FFmpegTransformArgs} from './contracts'
import path from 'path'
import {Worker} from 'worker_threads'
import {
  workerToEventBus,
  workerFunctionClient,
  WorkerFunctionClientEventBus,
} from '@flemist/worker-server'

export function createFFmpegTransformWorker(

): WorkerFunctionClientEventBus<any, any, any> {
  const worker = new Worker(path.resolve('./dist/ffmpeg/test/ffmpegTransformWorker.cjs'))
  const workerEventBus = workerToEventBus(worker)
  return workerEventBus
}

export function getFFmpegLoad(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegOptions, void, void>,
) {
  return workerFunctionClient<FFmpegOptions, void, void>({
    eventBus: workerEventBus,
    name    : 'ffmpegLoad',
  })
}

export function getFFmpegTransform(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegTransformArgs, Uint8Array, void>,
) {
  return workerFunctionClient<FFmpegTransformArgs, Uint8Array, void>({
    eventBus: workerEventBus,
    name    : 'ffmpegTransform',
  })
}
