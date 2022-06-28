import {FFmpegLoadEvent, FFmpegOptions, FFmpegTransformArgs} from './contracts'
import path from 'path'
import {Worker} from 'worker_threads'
import {
  workerToEventBus,
  workerFunctionClient,
  WorkerFunctionClientEventBus,
} from '@flemist/worker-server'

export function createFFmpegTransformWorker(

): WorkerFunctionClientEventBus {
  const worker = new Worker(path.resolve('./dist/ffmpeg/ffmpegTransformWorker.cjs'))
  const workerEventBus = workerToEventBus(worker)
  return workerEventBus
}

export function getFFmpegLoad(
  workerEventBus: WorkerFunctionClientEventBus<FFmpegOptions, void, FFmpegLoadEvent>,
) {
  return workerFunctionClient<FFmpegOptions, void, FFmpegLoadEvent>({
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
