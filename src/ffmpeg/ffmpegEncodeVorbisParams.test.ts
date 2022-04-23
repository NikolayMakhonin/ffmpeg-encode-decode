import {ffmpegEncodeVorbisParams} from './ffmpegEncodeVorbisParams'
import {ffmpegTestVariants} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeVorbisParams', function () {
  this.timeout(60000)

  it('abr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'ogg',
          params      : ffmpegEncodeVorbisParams({
            bitrate: 24,
            vbr    : false,
            cutoff : 0,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.container, 'Ogg')
          assert.strictEqual(metadata.format.codec, 'Vorbis I')
          assert.ok(metadata.format.bitrate > 23000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 25000, metadata.format.bitrate + '')
        },
      },
    })
  })

  it('vbr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'ogg',
          params      : ffmpegEncodeVorbisParams({
            bitrate: 24,
            vbr    : true,
            cutoff : 0,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.container, 'Ogg')
          assert.strictEqual(metadata.format.codec, 'Vorbis I')
          assert.ok(metadata.format.bitrate > 23000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 70000, metadata.format.bitrate + '')
        },
      },
    })
  })
})
