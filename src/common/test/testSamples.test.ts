import {testSamplesMono, testSamplesStereo} from './testSamples'
import {testAudioFunc} from './generateTestSamples'
import {checkSamples} from './checkSamples'

describe('io > audio > ffmpeg > testSamples', function () {
  this.timeout(10000)

  it('testSamplesStereo', function () {
    checkSamples({
      samples              : testSamplesStereo,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
    })
  })

  it('testSamplesMono', function () {
    checkSamples({
      samples              : testSamplesMono,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      isMono               : true,
    })
  })
})
