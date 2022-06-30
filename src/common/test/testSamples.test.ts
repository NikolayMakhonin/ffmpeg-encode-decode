import {testSamplesMono, testSamplesStereo} from './testSamples'
import {testAudioFunc} from './generateTestSamples'
import {checkSamples} from './checkSamples'
import {ffmpegTransformClient} from '../../ffmpeg/test/ffmpegTest'

describe('io > audio > ffmpeg > testSamples', function () {
  this.timeout(10000)

  after(async () => {
    await ffmpegTransformClient.terminate()
  })

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
