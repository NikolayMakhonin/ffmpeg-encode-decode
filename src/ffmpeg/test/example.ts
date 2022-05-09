import {
  ffmpegDecode,
  ffmpegEncode,
  AudioSamples,
  ffmpegEncodeVorbisParams,
  ffmpegEncodeMp3Params,
  ffmpegEncodeOpusParams,
} from '../../index'
import {FFmpegLoader} from '../FFmpegLoader'

const ffmpegLoader = new FFmpegLoader({
  log   : true,
  logger: ({type, message}) => console.log(`${type}: ${message}`),
})

export async function example() {
  const samples: AudioSamples = {
    data      : new Float32Array(16000 * 2 * 7), // 7 seconds of silence
    sampleRate: 16000,
    channels  : 2,
  }

  // encode mp3
  const mp3Data: Uint8Array = await ffmpegEncode(
    ffmpegLoader,
    samples,
    {
      outputFormat: 'mp3', // same as file extension
      channels    : 1, // auto convert to mono
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
      params      : ffmpegEncodeMp3Params({
        bitrate    : 64,
        mode       : 'abr',
        jointStereo: true,
      }),
    },
  )

  // encode ogg vorbis
  const oggVorbisData: Uint8Array = await ffmpegEncode(
    ffmpegLoader,
    samples,
    {
      outputFormat: 'ogg', // same as file extension
      channels    : 1, // auto convert to mono
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis
      params      : ffmpegEncodeVorbisParams({
        vbr       : true,
        vbrQuality: 3,
      }),
    },
  )

  // encode ogg opus
  // !! Attention opus encoder heavily distorts samples data
  const oggOpusData: Uint8Array = await ffmpegEncode(
    ffmpegLoader,
    samples,
    {
      outputFormat: 'opus', // same as file extension
      channels    : 1, // auto convert to mono
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1
      params      : ffmpegEncodeOpusParams({
        bitrate      : 32,
        vbr          : 'on',
        frameDuration: 40,
      }),
    },
  )

  // Auto recognize/detect/determine and decode any audio formats that supports in @flemist/ffmpeg.wasm-st library:

  const mp3Samples: AudioSamples = await ffmpegDecode(
    ffmpegLoader,
    mp3Data,
    {
      channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
      sampleRate: 32000, // auto convert sampleRate
    },
  )

  const oggVorbisSamples: AudioSamples = await ffmpegDecode(
    ffmpegLoader,
    oggVorbisData,
    {
      channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
      sampleRate: 32000, // auto convert sampleRate
    },
  )

  const oggOpusSamples: AudioSamples = await ffmpegDecode(
    ffmpegLoader,
    oggOpusData,
    {
      channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
      sampleRate: 32000, // auto convert sampleRate
    },
  )
}
