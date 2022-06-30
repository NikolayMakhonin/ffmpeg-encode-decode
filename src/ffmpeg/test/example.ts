// import {
//   ffmpegDecode,
//   ffmpegEncode,
//   AudioSamples,
//   ffmpegEncodeVorbisParams,
//   ffmpegEncodeMp3Params,
//   ffmpegEncodeOpusParams,
//   createFFmpegTransformClient,
//   getFFmpegTransform,
// } from '../../index'
//
// const ffmpegTransformClient = createFFmpegTransformClient({
//   log   : true,
//   logger: ({type, message}) => console.log(`${type}: ${message}`),
// })
//
// ffmpegTransformClient.load() // if you want to preload wasm
//
// const ffmpegTransform = getFFmpegTransform(ffmpegTransformClient)
//
// export async function example() {
//   const samples: AudioSamples = {
//     data      : new Float32Array(16000 * 2 * 7), // 7 seconds of silence
//     sampleRate: 16000,
//     channels  : 2,
//   }
//
//   // encode mp3
//   const mp3Data: Uint8Array = await ffmpegEncode(
//     ffmpegTransform,
//     samples,
//     {
//       outputFormat: 'mp3', // same as file extension
//       channels    : 1, // auto convert to mono
//       // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
//       params      : ffmpegEncodeMp3Params({
//         bitrate    : 64,
//         mode       : 'abr',
//         jointStereo: true,
//       }),
//     },
//   )
//
//   // encode ogg vorbis
//   const oggVorbisData: Uint8Array = await ffmpegEncode(
//     ffmpegTransform,
//     samples,
//     {
//       outputFormat: 'ogg', // same as file extension
//       channels    : 1, // auto convert to mono
//       // docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis
//       params      : ffmpegEncodeVorbisParams({
//         vbr       : true,
//         vbrQuality: 3,
//       }),
//     },
//   )
//
//   // encode ogg opus
//   // !! Attention opus encoder heavily distorts samples data
//   const oggOpusData: Uint8Array = await ffmpegEncode(
//     ffmpegTransform,
//     samples,
//     {
//       outputFormat: 'opus', // same as file extension
//       channels    : 1, // auto convert to mono
//       // docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1
//       params      : ffmpegEncodeOpusParams({
//         bitrate      : 32,
//         vbr          : 'on',
//         frameDuration: 40,
//       }),
//     },
//   )
//
//   // Auto recognize/detect/determine and decode any audio formats that supports in @flemist/ffmpeg.wasm-st library:
//
//   const mp3Samples: AudioSamples = await ffmpegDecode(
//     ffmpegTransform,
//     mp3Data,
//     {
//       channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
//       sampleRate: 32000, // auto convert sampleRate
//     },
//   )
//
//   const oggVorbisSamples: AudioSamples = await ffmpegDecode(
//     ffmpegTransform,
//     oggVorbisData,
//     {
//       channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
//       sampleRate: 32000, // auto convert sampleRate
//     },
//   )
//
//   const oggOpusSamples: AudioSamples = await ffmpegDecode(
//     ffmpegTransform,
//     oggOpusData,
//     {
//       channels  : 2, // auto convert mono to stereo (notice - this will turn the volume down to 60%)
//       sampleRate: 32000, // auto convert sampleRate
//     },
//   )
// }
