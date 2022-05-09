import {parentPort, workerData} from 'worker_threads'
import {createFFmpeg, CreateFFmpegOptions, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {FFmpegTransformArgs} from './contracts'

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg(options?: CreateFFmpegOptions) {
  if (!ffmpegLoadPromise) {
    if (options.logger) {
      options.logger = function logger(value) {
        parentPort.postMessage({
          type: 'logger',
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
): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg(workerData)
  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    inputFile,
    inputData,
  )

  await ffmpeg.run(
    '-loglevel', workerData.loglevel || 'error', // '-v', 'quiet', '-nostats', '-hide_banner',
    ...params,
  )

  const outputData = ffmpeg.FS(
    'readFile',
    outputFile,
  )

  ffmpeg.FS('unlink', inputFile)
  ffmpeg.FS('unlink', outputFile)

  return outputData
}

let isRunning: boolean = false
parentPort.on('message', async (value: FFmpegTransformArgs) => {
  if (isRunning) {
    parentPort.postMessage({
      type : 'ffmpegTransform',
      value: new Error('ffmpegTransform is running'),
    })
  }
  isRunning = true

  try {
    const result = await ffmpegTransform(...value)
    parentPort.postMessage({
      type : 'ffmpegTransform',
      value: result,
    })
  } catch (err) {
    parentPort.postMessage({
      type : 'ffmpegTransform',
      value: err,
    })
  } finally {
    isRunning = false
  }
})
