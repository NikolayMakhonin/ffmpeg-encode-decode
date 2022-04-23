import {generateTestSamples, testAudioFunc} from './generateTestSamples'

export const testSamplesStereo = generateTestSamples({
  audioFunc  : testAudioFunc,
  sampleRate : 16000,
  durationSec: 7,
  channels   : 2,
})

export const testSamplesMonoSplit = generateTestSamples({
  audioFunc  : testAudioFunc,
  sampleRate : 16000,
  durationSec: 7,
  channels   : 2,
  splitMono  : true,
})

export const testSamplesMono = generateTestSamples({
  audioFunc  : testAudioFunc,
  sampleRate : 16000,
  durationSec: 7,
  channels   : 1,
})
