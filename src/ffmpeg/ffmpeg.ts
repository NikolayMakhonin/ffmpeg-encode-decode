import {createFFmpeg, CreateFFmpegOptions, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {AudioSamples} from '../common/contracts'

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg(options?: CreateFFmpegOptions) {
  if (!ffmpegLoadPromise) {
    const ffmpeg = createFFmpeg(options)
    ffmpegLoadPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return ffmpegLoadPromise
}

async function _ffmpegTransform(inputData: Uint8Array, {
  inputFile,
  outputFile,
  params,
}: {
  inputFile?: string,
  outputFile?: string,
  params?: string[],
}): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg()

  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    inputFile,
    inputData,
  )

  await ffmpeg.run(...params)

  const outputData = ffmpeg.FS(
    'readFile',
    outputFile,
  )

  ffmpeg.FS('unlink', inputFile)
  ffmpeg.FS('unlink', outputFile)

  return outputData
}

export type FFmpegDecodeArgs = {
  /** same as file extension */
  inputFormat?: string,
  channels: number,
  sampleRate: number,
}

export async function ffmpegDecode(inputData: Uint8Array, {
  inputFormat,
  channels,
  sampleRate,
}: FFmpegDecodeArgs): Promise<AudioSamples> {
  const inputFile = 'input' + (inputFormat ? '.' + inputFormat : '')
  const outputFile = 'output.pcm'

  const outputData = await _ffmpegTransform(inputData, {
    inputFile,
    outputFile,
    params: [
      '-i', inputFile,
      '-f', 'f32le',
      '-ac', channels + '',
      '-ar', sampleRate + '',
      '-acodec', 'pcm_f32le',
      outputFile,
    ],
  })
  
  return {
    data: new Float32Array(outputData.buffer, outputData.byteOffset, outputData.byteLength / 4),
    channels,
    sampleRate,
  }
}

export type FFmpegEncodeArgs = {
  /** same as file extension */
  outputFormat: string,
  /** force channel count */
  channels?: number,
  params?: string[],
}

export async function ffmpegEncode(samples: AudioSamples, {
  outputFormat,
  channels,
  params,
}: FFmpegEncodeArgs): Promise<Uint8Array> {
  const inputFile = 'input.pcm'
  const outputFile = 'output' + (outputFormat ? '.' + outputFormat : '')

  const pcmData = new Uint8Array(
    samples.data.buffer,
    samples.data.byteOffset,
    samples.data.byteLength,
  )

  // docs: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
  const outputData = await _ffmpegTransform(pcmData, {
    inputFile,
    outputFile,
    params: [
      '-f', 'f32le',
      '-ac', samples.channels + '',
      '-ar', samples.sampleRate + '',
      '-i', 'input.pcm',
      '-ac', (channels || samples.channels) + '',
      ...params || [],
      outputFile,
    ],
  })

  return outputData
}

