import {ffmpegDecode, FFmpegDecodeArgs, ffmpegEncode, FFmpegEncodeArgs} from '../ffmpeg'
import {testSamplesMono, testSamplesMonoSplit, testSamplesStereo} from '../../common/test/testSamples'
import {checkSamples} from '../../common/test/checkSamples'
import {shareSamples, testAudioFunc} from '../../common/test/generateTestSamples'
import * as musicMetadata from 'music-metadata'
import {IAudioMetadata} from 'music-metadata/lib/type'
import {AudioSamples} from '../../common/contracts'
import {getFFmpegTransform} from '../getFFmpegTransform'
import {FFmpegTransformClientMT} from '../FFmpegTransformClientMT'

let logSize = 0
export const ffmpegTransformClient = new FFmpegTransformClientMT(
  './dist/ffmpeg/ffmpegTransformWorker.cjs',
  {
    threads: 4,
    preload: true,
    log    : false,
    logger({data: {type, message}}) {
      logSize += `[${type}] ${message}\n`.length
      console.log('Log: ' + logSize)
      // console.log(`[${type}] ${message}`)
    },
  },
)

const ffmpegTransform = getFFmpegTransform(ffmpegTransformClient)

export async function ffmpegTestEncode({
  inputType,
  encode: {
    encodeArgs,
    checkEncodedMetadata,
  },
}: {
  inputType: 'mono' | 'stereo' | 'mono-split',
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
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

  const data = await ffmpegEncode(ffmpegTransform, input, encodeArgs)

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
}: {
  inputData: Uint8Array,
  decode: {
    decodeArgs: FFmpegDecodeArgs,
    checkDecoded: {
      isMono?: boolean,
      minAmplitude?: number,
    },
  },
}) {
  const samples = await ffmpegDecode(ffmpegTransform, inputData, decodeArgs)

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
