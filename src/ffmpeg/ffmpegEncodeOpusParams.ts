export type OpusBitrate = 6 | 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128 | 160 | 192 | 256
export type OpusCompression = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type OpusApplication = 'voip' | 'audio' | 'lowdelay'
export type OpusVbr = 'off' | 'on' | 'constrained'
export type OpusCutoff = 0 | 4000 | 6000 | 8000 | 12000 | 20000
export type OpusFrameDurationMs = 2.5 | 5 | 10 | 20 | 40 | 60

/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1 */
export function ffmpegEncodeOpusParams(options: {
  bitrate: OpusBitrate,
  vbr?: OpusVbr,
  compression?: OpusCompression,
  application?: OpusApplication,
  cutoff?: OpusCutoff,
  frameDuration?: OpusFrameDurationMs,
  params?: string[],
}): string[] {
  return [
    '-c:a', 'libopus',
    '-b:a', options.bitrate + 'k',
    '-vbr', options.vbr || 'on',
    '-compression_level', (options.compression || 10) + '',
    '-frame_duration', (options.frameDuration || 20) + '',
    '-application', options.application || 'audio',
    '-cutoff', (options.cutoff || 0) + '',
    ...options.params || [],
  ]
}
