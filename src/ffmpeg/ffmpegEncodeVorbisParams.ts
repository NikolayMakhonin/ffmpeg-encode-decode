export type VorbisBitrate = 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128 | 160 | 192 | 256
export type VorbisVbrQuality = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type VorbisCutoff = 0 | 4000 | 6000 | 8000 | 12000 | 20000

/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis */
export function ffmpegEncodeVorbisParams(options: {
  bitrate?: VorbisBitrate,
  vbr?: boolean,
  vbrQuality?: VorbisVbrQuality,
  minRate?: VorbisBitrate,
  maxRate?: VorbisBitrate,
  cutoff?: VorbisCutoff,
  params?: string[],
}): string[] {
  const bitrate = options.bitrate || 128
  const vbr = options.vbr ?? true
  const vbrQuality = options.vbrQuality ?? 3

  const result = ['-c:a', 'libvorbis']

  if (vbr) {
    result.push('-q:a', vbrQuality + '')
  } else {
    result.push('-b:a', bitrate + 'k')
  }

  if (options.minRate) {
    result.push('-minrate', options.minRate + 'k')
  }

  if (options.maxRate) {
    result.push('-maxrate', options.maxRate + 'k')
  }

  if (options.cutoff) {
    result.push('-cutoff', options.cutoff  + '')
  }

  if (options.params) {
    result.push(...options.params)
  }

  return result
}
