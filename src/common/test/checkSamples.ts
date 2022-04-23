import {AudioSamples} from '../contracts'

function getFirstMaximum({
  getSample,
  windowSize,
  samplesCount,
}: {
  getSample: (index: number) => number,
  windowSize: number,
  samplesCount: number,
}) {
  let sum = 0
  let prevAvg
  let maximumStart
  let maximumEnd
  for (let i = 0; i < samplesCount; i++) {
    const sample = getSample(i)
    sum += Math.abs(sample)
    if (i >= windowSize) {
      const prevSample = getSample(i - windowSize)
      sum -= prevSample
    }
    if (i >= windowSize - 1) {
      const avg = sum / windowSize
      if (i === windowSize - 1 || avg > prevAvg) {
        prevAvg = avg
        maximumStart = i
      } else if (prevAvg > 0.1 && avg < prevAvg) {
        maximumEnd = i - 1
        break
      }
    }
  }

  if (prevAvg == null || maximumStart == null || maximumEnd == null) {
    throw new Error('Cannot find first maximum')
  }

  const index = Math.round((maximumEnd + maximumStart - windowSize) / 2)
  const value = getSample(index)

  return {
    index,
    value,
  }
}

export function checkSamples({
  samples,
  checkAudioFunc,
  checkAudioDurationSec,
  isMono,
  minAmplitude,
}: {
  samples: AudioSamples,
  checkAudioFunc: (time: number, channel: number) => number,
  checkAudioDurationSec: number,
  isMono?: boolean,
  minAmplitude?: number,
}) {
  assert.strictEqual(samples.data.length % samples.channels, 0)
  const samplesCount = samples.data.length / samples.channels

  const sampleRate = samples.sampleRate
  const checkFirstMaximum = getFirstMaximum({
    samplesCount,
    windowSize: Math.round(0.1 * sampleRate),
    getSample : o => checkAudioFunc(o / sampleRate, 0),
  })
  const firstMaximum = getFirstMaximum({
    samplesCount,
    windowSize: Math.round(0.1 * sampleRate),
    getSample : o => samples.data[o * samples.channels],
  })
  const startSample = firstMaximum.index - checkFirstMaximum.index
  const startTime = startSample / sampleRate

  assert.ok(startTime >= -0.1, startTime + '')
  assert.ok(startTime <= 0.2, startTime + '')

  const amplitude = firstMaximum.value / checkFirstMaximum.value
  assert.ok(amplitude >= (minAmplitude ?? 0.85), amplitude + '')
  assert.ok(amplitude <= 1.05, amplitude + '')

  const totalDuration = (samplesCount - startSample) / samples.sampleRate
  assert.ok(totalDuration >= checkAudioDurationSec - 0.05, totalDuration + '')
  assert.ok(totalDuration <= checkAudioDurationSec + 0.05, totalDuration + '')

  for (let channel = 0; channel < samples.channels; channel++) {
    let sumError = 0
    for (let i = startSample; i < samplesCount; i++) {
      const sample = i < 0 ? 0 : samples.data[i * samples.channels + channel] / amplitude
      assert.ok(Number.isFinite(sample))
      const checkSample = checkAudioFunc(
        (i - startSample) / sampleRate,
        isMono ? 0 : channel,
      )
      const error = Math.abs(checkSample - sample)
      sumError += error * error
    }

    const avgError = sumError / samplesCount
    assert.ok(Number.isFinite(avgError))
    assert.ok(avgError < 0.06, avgError + '')
  }
}
