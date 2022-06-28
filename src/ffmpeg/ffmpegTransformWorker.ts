import {parentPort, workerData} from 'worker_threads'
import {createFFmpeg, CreateFFmpegOptions, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {FFmpegLoadEvent, FFmpegOptions, FFmpegTransformArgs} from './contracts'
import {
  WorkerData,
  workerFunctionServer,
  WorkerFunctionServerResultAsync,
  messagePortToEventBus,
} from '@flemist/worker-server'

let ffmpegOptions: FFmpegOptions = workerData

let ffmpegLoadPromise: Promise<FFmpeg>
function getFFmpeg(options?: FFmpegOptions) {
  if (!ffmpegLoadPromise) {
    ffmpegOptions = options
    if (options.logger) {
      options.logger = function logger(value) {
        parentPort.postMessage({
          callbackId: 'logger',
          value,
        })
      }
    } else {
      delete options.logger
    }

    const ffmpeg = createFFmpeg(options)
    ffmpegLoadPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return ffmpegLoadPromise
}

async function ffmpegLoad(
  data: WorkerData<Omit<CreateFFmpegOptions, 'logger'>>,
  abortSignal, // TODO
  callback: (data: WorkerData<FFmpegLoadEvent>) => void,
): WorkerFunctionServerResultAsync<void> {
  const options: CreateFFmpegOptions = {
    ...data.data,
  }
  if (options.log) {
    options.logger = ({type, message}) => {
      callback({data: {type, message}})
    }
  }
  await getFFmpeg(options)
  return {}
}

const ffmpegTransformRunCount: number = 0
let ffmpegTransformRunning: boolean = false
async function ffmpegTransform(
  data: WorkerData<FFmpegTransformArgs>,
): WorkerFunctionServerResultAsync<Uint8Array> {
  if (ffmpegTransformRunning) {
    throw new Error('ffmpegTransform is running')
  }
  ffmpegTransformRunning = true

  const {
    data: [
      inputData,
      {
        inputFile,
        outputFile,
        params,
      },
    ],
  } = data

  try {
    const ffmpeg = await getFFmpeg(ffmpegOptions)
    // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
    ffmpeg.FS(
      'writeFile',
      inputFile,
      inputData,
    )

    await ffmpeg.run(
      '-loglevel', ffmpegOptions.loglevel || 'error', // '-v', 'quiet', '-nostats', '-hide_banner',
      ...params,
    )

    const outputData = ffmpeg.FS(
      'readFile',
      outputFile,
    )

    ffmpeg.FS('unlink', inputFile)
    ffmpeg.FS('unlink', outputFile)

    return {
      data        : outputData,
      transferList: [outputData.buffer],
    }
  } finally {
    ffmpegTransformRunning = false
    if (ffmpegTransformRunCount >= 15000) {
      console.log(`Unload ffmpegTransform worker after ${this._runCount} calls`)
      process.exit(0)
    }
  }
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : ffmpegTransform,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : ffmpegLoad,
})
