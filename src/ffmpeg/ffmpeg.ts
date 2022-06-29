import {AudioSamples} from '../common/contracts'
import {FFmpegTransform} from './contracts'

// let encodeInputSize = 0
// let encodeOutputSize = 0
// let encodeCount = 0
// let decodeInputSize = 0
// let decodeOutputSize = 0
// let decodeCount = 0

export type FFmpegDecodeArgs = {
  /** same as file extension */
  inputFormat?: string,
  channels: number,
  sampleRate: number,
}

export async function ffmpegDecode(
  ffmpegTransform: FFmpegTransform,
  inputData: Uint8Array,
  {
    inputFormat,
    channels,
    sampleRate,
  }: FFmpegDecodeArgs,
): Promise<AudioSamples> {
  const inputFile = 'input' + (inputFormat ? '.' + inputFormat : '')
  const outputFile = 'output.pcm'
  // decodeInputSize += inputData.byteLength

  const outputData = await ffmpegTransform(
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

  // decodeOutputSize += outputData.byteLength
  // decodeCount++
  // console.log(`Decode: ${decodeCount}, ${decodeInputSize}, ${decodeOutputSize}`)

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
  ffmpegTransform: FFmpegTransform,
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

  // encodeInputSize += pcmData.byteLength

  // docs: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
  const outputData = await ffmpegTransform(
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

  // encodeOutputSize += outputData.byteLength
  // encodeCount++
  // console.log(`Encode: ${encodeCount}, ${encodeInputSize}, ${encodeOutputSize}`)

  return outputData
}

