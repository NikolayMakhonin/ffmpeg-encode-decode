[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][github-image]][github-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Well tested WASM (WebAssembly) in-memory encoder/decoder mp3/ogg/opus/vorbis from/to Float32Array based on [@flemist/ffmpeg.wasm-st](https://www.npmjs.com/package/@flemist/ffmpeg.wasm-st)

I think this should work in the browser, but I haven't tested.

```ts
import {
  ffmpegDecode,
  ffmpegEncode,
  AudioSamples,
  ffmpegEncodeVorbisParams,
  ffmpegEncodeMp3Params,
  ffmpegEncodeOpusParams,
  getFFmpeg,
} from '@flemist/ffmpeg-encode-decode'

// Optional: preload ffmpeg library and enable logger
getFFmpeg({
  log   : true,
  logger: ({message}) => console.log(message),
})

export async function example() {
  const samples: AudioSamples = {
    data      : new Float32Array(16000 * 2 * 7), // 7 seconds of silence
    sampleRate: 16000,
    channels  : 2,
  }

  // encode mp3
  const mp3Data: Uint8Array = await ffmpegEncode(samples, {
    outputFormat: 'mp3', // same as file extension
    channels    : 1, // auto convert to mono
    // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
    params      : ffmpegEncodeMp3Params({
      bitrate    : 64,
      mode       : 'abr',
      jointStereo: true,
    }),
  })

  // encode ogg vorbis
  const oggVorbisData: Uint8Array = await ffmpegEncode(samples, {
    outputFormat: 'ogg', // same as file extension
    channels    : 1, // auto convert to mono
    // docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis
    params      : ffmpegEncodeVorbisParams({
      vbr       : true,
      vbrQuality: 3,
    }),
  })

  // encode ogg opus
  // !! Attention opus encoder heavily distorts samples data
  const oggOpusData: Uint8Array = await ffmpegEncode(samples, {
    outputFormat: 'opus', // same as file extension
    channels    : 1, // auto convert to mono
    // docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1
    params      : ffmpegEncodeOpusParams({
      bitrate      : 32,
      vbr          : 'on',
      frameDuration: 40,
    }),
  })

  // Auto recognize/detect/determine and decode any audio formats that supports in @flemist/ffmpeg.wasm-st library:
  
  const mp3Samples: AudioSamples = await ffmpegDecode(mp3Data, {
    channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
    sampleRate: 32000, // auto convert sampleRate
  })

  const oggVorbisSamples: AudioSamples = await ffmpegDecode(oggVorbisData, {
    channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
    sampleRate: 32000, // auto convert sampleRate
  })

  const oggOpusSamples: AudioSamples = await ffmpegDecode(oggOpusData, {
    channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
    sampleRate: 32000, // auto convert sampleRate
  })
}
```

# License

[Unlimited Free](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@flemist/ffmpeg-encode-decode.svg
[npm-url]: https://npmjs.org/package/@flemist/ffmpeg-encode-decode
[downloads-image]: https://img.shields.io/npm/dm/@flemist/ffmpeg-encode-decode.svg
[downloads-url]: https://npmjs.org/package/@flemist/ffmpeg-encode-decode
[github-image]: https://github.com/NikolayMakhonin/ffmpeg-encode-decode/actions/workflows/test.yml/badge.svg
[github-url]: https://github.com/NikolayMakhonin/ffmpeg-encode-decode/actions
[coveralls-image]: https://coveralls.io/repos/github/NikolayMakhonin/ffmpeg-encode-decode/badge.svg
[coveralls-url]: https://coveralls.io/github/NikolayMakhonin/ffmpeg-encode-decode
