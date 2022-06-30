import {parentPort, threadId} from 'worker_threads'
import {createFFmpeg, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {CreateFFmpegOptionsExt, FFmpegInitEvent, FFmpegOptions, FFmpegTransformArgs} from './contracts'
import {
  WorkerData,
  workerFunctionServer,
  WorkerFunctionServerResultAsync,
  messagePortToEventBus,
} from '@flemist/worker-server'
import {options} from "tsconfig-paths/lib/options";

let ffmpegOptions: CreateFFmpegOptionsExt
let getFFmpegPromise: Promise<FFmpeg>
function getFFmpeg() {
  if (!ffmpegOptions) {
    throw new Error('You should call ffmpegInit before')
  }
  if (!getFFmpegPromise) {
    const ffmpeg = createFFmpeg(ffmpegOptions)
    getFFmpegPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return getFFmpegPromise
}

async function ffmpegInit(
  data: WorkerData<Omit<FFmpegOptions, 'logger'>>,
  abortSignal, // TODO
  callback: (data: WorkerData<FFmpegInitEvent>) => void,
): WorkerFunctionServerResultAsync<void> {
  ffmpegOptions = {
    ...data.data,
  }
  if (ffmpegOptions.logger) {
    ffmpegOptions.logger = ({type, message}) => {
      if (type === 'info'
        && !(ffmpegOptions.loglevel === 'info'
        || ffmpegOptions.loglevel === 'verbose'
        || ffmpegOptions.loglevel === 'debug')
      ) {
        return
      }
      callback({data: {threadId, type, message}})
    }
  }
  else {
    delete ffmpegOptions.logger
  }
  if (ffmpegOptions.preload) {
    await getFFmpeg()
  }
  return {}
}

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
    const ffmpeg = await getFFmpeg()
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
  }
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : ffmpegTransform,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : ffmpegInit,
})
