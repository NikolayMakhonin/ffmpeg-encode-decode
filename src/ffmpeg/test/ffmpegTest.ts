import {ffmpegDecode, FFmpegDecodeArgs, ffmpegEncode, FFmpegEncodeArgs} from '../ffmpeg'
import {testSamplesMono, testSamplesMonoSplit, testSamplesStereo} from '../../common/test/testSamples'
import {checkSamples} from '../../common/test/checkSamples'
import {shareSamples, testAudioFunc} from '../../common/test/generateTestSamples'
import * as musicMetadata from 'music-metadata'
import {IAudioMetadata} from 'music-metadata/lib/type'
import {AudioSamples} from '../../common/contracts'
import {getFFmpegTransform} from '../getFFmpegTransform'
import {FFmpegTransformClientPool} from '../FFmpegTransformClientPool'
import {Pool} from '@flemist/time-limits'
import {Priority} from '@flemist/priority-queue'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

let logSize = 0
export const ffmpegTransformClient = new FFmpegTransformClientPool({
  threadsPool: new Pool(3),
  preInit    : true,
  options    : {
    preload : true,
    log     : false,
    loglevel: 'warning',
    logger({data: {threadId, type, message}}) {
      logSize += `[${type}] ${message}\n`.length
      console.log(`Log (${threadId}): ` + logSize)
      console.log(`[${threadId}] [${type}] ${message}`)
    },
  },
})

const ffmpegTransform = getFFmpegTransform(ffmpegTransformClient)

export async function ffmpegTestEncode({
  inputType,
  encode: {
    encodeArgs,
    checkEncodedMetadata,
  },
  priority,
  abortSignal,
}: {
  inputType: 'mono' | 'stereo' | 'mono-split',
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  let input: AudioSamples
  switch (inputType) {
    case 'mono':
      input = shareSamples(testSamplesMono)
      break
    case 'stereo':
      input = shareSamples(testSamplesStereo)
      break
    case 'mono-split':
      input = shareSamples(testSamplesMonoSplit)
      break
    default:
      throw new Error('Unknown inputType: ' + inputType)
  }

  const inputDataLength = input.data.length

  const data = await ffmpegEncode({
    ffmpegTransform,
    samples: input,
    encode : encodeArgs,
    priority,
    abortSignal,
  })

  assert.ok(data.length > 100, data.length + '')

  // await saveFile('mpeg.ogg', data)

  if (checkEncodedMetadata) {
    const metadata = await musicMetadata.parseBuffer(data)

    assert.strictEqual(metadata.format.sampleRate, input.sampleRate)
    assert.strictEqual(metadata.format.numberOfChannels, encodeArgs.channels || input.channels)
    const checkDuration = inputDataLength / input.channels / input.sampleRate
    assert.ok(metadata.format.duration >= checkDuration - 0.05, metadata.format.duration + '')
    assert.ok(metadata.format.duration <= checkDuration + 0.15, metadata.format.duration + '')
    checkEncodedMetadata(metadata)
  }

  return data
}

export async function ffmpegTestDecode({
  inputData,
  decode: {
    decodeArgs,
    checkDecoded: {
      isMono,
      minAmplitude,
    },
  },
  priority,
  abortSignal,
}: {
  inputData: Uint8Array,
  decode: {
    decodeArgs: FFmpegDecodeArgs,
    checkDecoded: {
      isMono?: boolean,
      minAmplitude?: number,
    },
  },
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  const samples = await ffmpegDecode({
    ffmpegTransform,
    inputData,
    decode: decodeArgs,
    priority,
    abortSignal,
  })

  // const _data = await ffmpegEncode(samples, {
  //   outputFormat: 'mp3',
  //   params      : ffmpegEncodeMp3Params({
  //     bitrate: 8,
  //     mode   : 'cbr',
  //   }),
  // })
  // await saveFile('mpeg.mp3', _data)

  checkSamples({
    samples,
    checkAudioFunc       : testAudioFunc,
    checkAudioDurationSec: 7,
    isMono,
    minAmplitude,
  })

  return samples
}

export async function ffmpegTestStereo({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  const data = await ffmpegTestEncode({
    inputType: 'stereo',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        inputFormat: encode.encodeArgs.outputFormat,
        channels   : 2,
        sampleRate : 32000,
      },
      checkDecoded: {},
    },
  })
}

export async function ffmpegTestMono({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  const data = await ffmpegTestEncode({
    inputType: 'mono',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data.buffer instanceof SharedArrayBuffer
      ? data
      : data.slice(),
    decode: {
      decodeArgs: {
        inputFormat: encode.encodeArgs.outputFormat,
        channels   : 1,
        sampleRate : 32000,
      },
      checkDecoded: {
        isMono: true,
      },
    },
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        inputFormat: encode.encodeArgs.outputFormat,
        channels   : 2,
        sampleRate : 32000,
      },
      checkDecoded: {
        isMono      : true,
        minAmplitude: 0.6,
      },
    },
  })
}

export async function ffmpegTestMonoSplit({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  let data = await ffmpegTestEncode({
    inputType: 'mono-split',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        inputFormat: encode.encodeArgs.outputFormat,
        channels   : 1,
        sampleRate : 32000,
      },
      checkDecoded: {
        isMono      : true,
        minAmplitude: 0.6,
      },
    },
  })

  data = await ffmpegTestEncode({
    inputType: 'mono-split',
    encode   : {
      ...encode,
      encodeArgs: {
        ...encode.encodeArgs,
        channels: 1,
      },
    },
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        inputFormat: encode.encodeArgs.outputFormat,
        channels   : 2,
        sampleRate : 32000,
      },
      checkDecoded: {
        isMono      : true,
        minAmplitude: 0.4,
      },
    },
  })
}

export async function ffmpegTestVariants(options: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  await ffmpegTestStereo(options)
  await ffmpegTestMono(options)
  await ffmpegTestMonoSplit(options)

  // await Promise.all([
  //   ffmpegTestStereo(options),
  //   ffmpegTestMono(options),
  //   ffmpegTestMonoSplit(options),
  // ])
}
