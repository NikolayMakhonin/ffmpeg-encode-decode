'use strict'

const path = require('path')
const ffmpegTransformWorkerPath = path.resolve(__dirname, '../../dist/ffmpeg/ffmpegTransformWorker.cjs')

module.exports = {
  ffmpegTransformWorkerPath,
}
