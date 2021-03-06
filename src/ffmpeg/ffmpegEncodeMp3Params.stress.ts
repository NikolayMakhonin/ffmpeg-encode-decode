import './test/processExitDebug'
import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {ffmpegTestVariants, ffmpegTransformClient} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(24 * 60 * 60 * 1000)

  after(async () => {
    await ffmpegTransformClient.terminate()
  })

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

  it('vbr joint stereo stress pool', async function () {
    for (let i = 0; i < 10000; i++) { // should be more than (31 * threads) iterations
      const timeStart = Date.now()
      const promises = []
      for (let j = 0; j < 100; j++) {
        const promise = ffmpegTestVariants({
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

        promises.push(promise)
      }

      await Promise.all(promises)

      console.log(`iterations: ${i + 1}, ${Date.now() - timeStart} ms`)
    }

    // CPU 8 cores
    // <threads>: <time per iteration (100 ffmpegTestVariants calls)>
    // 1: 39926 ms
    // 2: 21995 ms
    // 3: 16300 ms
    // 4: 13622 ms
    // 5: 13164 ms
    // 6: 12501 ms
    // 7: 12199 ms
    // 8: 12122 ms
    // 9: 12147 ms
    // 10: 12228 ms

  })
})
