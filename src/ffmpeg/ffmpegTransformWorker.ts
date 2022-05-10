import {parentPort, workerData} from 'worker_threads'
import {createFFmpeg, CreateFFmpegOptions, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {FFmpegOptions, FFmpegTransformArgs} from './contracts'

let ffmpegOptions: FFmpegOptions = workerData

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg(options?: FFmpegOptions) {
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

async function ffmpegLoad(options?: CreateFFmpegOptions) {
  await getFFmpeg(options)
}

let ffmpegTransformRunning: boolean = false
async function ffmpegTransform(
  inputData: Uint8Array,
  {
    inputFile,
    outputFile,
    params,
  }: {
    inputFile?: string,
    outputFile?: string,
    params?: string[],
  },
) {
  if (ffmpegTransformRunning) {
    throw new Error('ffmpegTransform is running')
  }
  ffmpegTransformRunning = true

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

    return [outputData, [outputData.buffer]]
  } finally {
    ffmpegTransformRunning = false
  }
}

const methods: {
  [key in string]: (...args: any[]) => any
} = {
  ffmpegLoad,
  ffmpegTransform,
}

parentPort.on('message', async ({
  requestId,
  value: {
    method,
    args,
  },
}: {
  requestId: number,
  value: {
    method: string,
    args: FFmpegTransformArgs
  },
}) => {
  try {
    const func = methods[method]
    if (!func) {
      throw new Error('Unknown method: ' + method)
    }
    const [result, transferList] = (await func.apply(null, args)) || []
    parentPort.postMessage({
      requestId,
      value: result,
    }, transferList)
  } catch (err) {
    parentPort.postMessage({
      requestId,
      error: err,
    })
  }
})
