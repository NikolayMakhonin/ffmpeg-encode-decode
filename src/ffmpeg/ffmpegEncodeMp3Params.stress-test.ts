import './test/processExitDebug'
import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {ffmpegTestVariants} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(24 * 60 * 60 * 1000)

  it('vbr joint stereo stress', async function () {
    for (let i = 0; i < 100000; i++) { // should be more than 3007 iterations
      console.log('iteration: ' + i)
      await ffmpegTestVariants({
        encode: {
          encodeArgs: {
            outputFormat: 'mp3',
            params      : ffmpegEncodeMp3Params({
              vbrQuality : 5,
              mode       : 'vbr',
              jointStereo: true,
            }),
          },
          // eslint-disable-next-line no-loop-func
          checkEncodedMetadata(metadata) {
            assert.strictEqual(metadata.format.lossless, false)
            assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
            // assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
            // assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
            assert.strictEqual(metadata.format.codecProfile, 'V10')
          },
        },
      })
    }
  })
})
