import {ffmpegEncodeOpusParams} from './ffmpegEncodeOpusParams'
import {ffmpegTestVariants, ffmpegTransformClient} from './test/ffmpegTest'

xdescribe('io > audio > ffmpeg > ffmpegEncodeOpusParams', function () {
  this.timeout(60000)

  after(async () => {
    await ffmpegTransformClient.terminate()
  })

  it('audio', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'opus',
          params      : ffmpegEncodeOpusParams({
            bitrate      : 8,
            application  : 'audio',
            vbr          : 'off',
            compression  : 3,
            cutoff       : 0,
            frameDuration: 20,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.container, 'Ogg')
          assert.strictEqual(metadata.format.codec, 'Opus')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
        },
      },
    })
  })
})
