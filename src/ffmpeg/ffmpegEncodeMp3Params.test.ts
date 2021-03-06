import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {ffmpegTestVariants, ffmpegTransformClient} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(60000)

  after(async () => {
    await ffmpegTransformClient.terminate()
  })

  it('cbr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'cbr',
            jointStereo: false,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.strictEqual(metadata.format.bitrate, 8000)
          assert.strictEqual(metadata.format.codecProfile, 'CBR')
        },
      },
    })
  })

  it('abr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'abr',
            jointStereo: false,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
          assert.strictEqual(metadata.format.codecProfile, 'V10')
        },
      },
    })
  })

  it('vbr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            vbrQuality : 5,
            mode       : 'vbr',
            jointStereo: false,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
          assert.strictEqual(metadata.format.codecProfile, 'V10')
        },
      },
    })
  })

  it('cbr joint stereo', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'cbr',
            jointStereo: true,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.strictEqual(metadata.format.bitrate, 8000)
          assert.strictEqual(metadata.format.codecProfile, 'CBR')
        },
      },
    })
  })

  it('abr joint stereo', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'abr',
            jointStereo: true,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
          assert.strictEqual(metadata.format.codecProfile, 'V10')
        },
      },
    })
  })

  it('vbr joint stereo', async function () {
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
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
          assert.strictEqual(metadata.format.codecProfile, 'V10')
        },
      },
    })
  })

  xit('vbr joint stereo stress simple', async function () {
    this.timeout(15 * 60 * 1000)

    for (let i = 0; i < 300; i++) {
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
            assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
            assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
            assert.strictEqual(metadata.format.codecProfile, 'V10')
          },
        },
      })
    }
  })
})
