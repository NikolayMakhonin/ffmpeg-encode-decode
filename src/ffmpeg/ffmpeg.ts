import {AudioSamples} from '../common/contracts'
import {IFFmpegLoader} from './contracts'

let encodeInputSize = 0
let encodeOutputSize = 0
let encodeCount = 0
let decodeInputSize = 0
let decodeOutputSize = 0
let decodeCount = 0
function _ffmpegTransform(
  ffmpegLoader: IFFmpegLoader,
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
  return ffmpegLoader.run(async (ffmpeg) => {
    // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
    ffmpeg.FS(
      'writeFile',
      inputFile,
      inputData,
    )

    await ffmpeg.run(
      '-loglevel', ffmpegLoader.options.loglevel || 'error', // '-v', 'quiet', '-nostats', '-hide_banner',
      ...params,
    )

    const outputData = ffmpeg.FS(
      'readFile',
      outputFile,
    )

    ffmpeg.FS('unlink', inputFile)
    ffmpeg.FS('unlink', outputFile)

    return outputData
  })
}

export type FFmpegDecodeArgs = {
  /** same as file extension */
  inputFormat?: string,
  channels: number,
  sampleRate: number,
}

export async function ffmpegDecode(
  ffmpegLoader: IFFmpegLoader,
  inputData: Uint8Array,
  {
    inputFormat,
    channels,
    sampleRate,
  }: FFmpegDecodeArgs,
): Promise<AudioSamples> {
  const inputFile = 'input' + (inputFormat ? '.' + inputFormat : '')
  const outputFile = 'output.pcm'

  const outputData = await _ffmpegTransform(
    ffmpegLoader,
    inputData,
    {
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
    },
  )

  decodeInputSize += inputData.byteLength
  decodeOutputSize += outputData.byteLength
  decodeCount++
  console.log(`Decode: ${decodeCount}, ${decodeInputSize}, ${decodeOutputSize}`)

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

export async function ffmpegEncode(
  ffmpegLoader: IFFmpegLoader,
  samples: AudioSamples,
  {
    outputFormat,
    channels,
    params,
  }: FFmpegEncodeArgs,
): Promise<Uint8Array> {
  const inputFile = 'input.pcm'
  const outputFile = 'output' + (outputFormat ? '.' + outputFormat : '')

  const pcmData = new Uint8Array(
    samples.data.buffer,
    samples.data.byteOffset,
    samples.data.byteLength,
  )

  // docs: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
  const outputData = await _ffmpegTransform(
    ffmpegLoader,
    pcmData,
    {
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
    },
  )

  encodeInputSize += pcmData.byteLength
  encodeOutputSize += outputData.byteLength
  encodeCount++
  console.log(`Encode: ${encodeCount}, ${encodeInputSize}, ${encodeOutputSize}`)

  return outputData
}

