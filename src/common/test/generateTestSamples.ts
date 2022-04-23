import {AudioSamples} from '../contracts'

/**
 * left: 1Hz-100%-2sec silence-2sec 2Hz-50%-3sec
 * right: 2Hz-50%-3sec silence-2sec 1Hz-100%-2sec
 */
export function testAudioFunc(time: number, channel: number, splitMono?: boolean): number {
  if (time > 7) {
    return 0
  }

  if (!splitMono) {
    switch (channel) {
      case 0:
        if (time <= 2) {
          return Math.sin(time * 2 * Math.PI)
        }
        if (time <= 4) {
          return 0
        }
        return 0.5 * Math.sin((time - 4) * 4 * Math.PI)
      case 1:
        if (time <= 3) {
          return 0.5 * Math.sin(time * 4 * Math.PI)
        }
        if (time <= 5) {
          return 0
        }
        return Math.sin((time - 5) * 2 * Math.PI)
      default:
        throw new Error('channel === ' + channel)
    }
  } else {
    switch (channel) {
      case 0:
        if (time <= 2) {
          return Math.sin(time * 2 * Math.PI)
        }
        return 0
      case 1:
        if (time <= 4) {
          return 0
        }
        return 0.5 * Math.sin((time - 4) * 4 * Math.PI)
      default:
        throw new Error('channel === ' + channel)
    }
  }
}

export function generateTestSamples({
  audioFunc,
  sampleRate,
  durationSec,
  channels,
  splitMono,
}: {
  audioFunc: (time: number, channel: number, splitMono?: boolean) => number,
  sampleRate: number,
  durationSec: number,
  channels: number,
  splitMono?: boolean,
}) {
  const samplesCount = durationSec * sampleRate
  const samples: AudioSamples = {
    data: new Float32Array(samplesCount * channels),
    channels,
    sampleRate,
  }
  for (let i = 0; i < samplesCount; i++) {
    for (let channel = 0; channel < channels; channel++) {
      samples.data[i * channels + channel] = audioFunc(i / sampleRate, channel, splitMono)
    }
  }
  return samples
}
