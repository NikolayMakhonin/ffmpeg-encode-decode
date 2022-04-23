export type Mp3Bitrate = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320
export type Mp3VbrQuality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type Mp3Mode = 'cbr' | 'abr' | 'vbr'

/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame */
export function ffmpegEncodeMp3Params(options: {
  bitrate?: Mp3Bitrate,
  mode?: Mp3Mode,
  vbrQuality?: Mp3VbrQuality,
  jointStereo?: boolean,
  params?: string[],
}): string[] {
  const bitrate = options.bitrate || 128
  const mode = options.mode ?? 'cbr'
  const jointStereo = options.jointStereo ?? true
  const vbrQuality = options.vbrQuality ?? 3

  const result = []

  if (mode === 'vbr') {
    result.push('-q:a', vbrQuality + '')
  } else {
    result.push('-b:a', bitrate + 'k')
  }

  if (jointStereo) {
    result.push('-joint_stereo', '1')
  }

  if (mode === 'abr') {
    result.push('-abr', '1')
  }

  if (options.params) {
    result.push(...options.params)
  }

  return result
}
