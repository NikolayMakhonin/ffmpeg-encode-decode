import {FFmpegOptions, IFFmpegLoader} from './contracts'
import {createFFmpeg, CreateFFmpegOptions, FFmpeg} from '@flemist/ffmpeg.wasm-st'
import {FFmpegWrapper} from './FFmpegWrapper'
import {Locker} from './locker'

export class FFmpegLoader<TOptions extends CreateFFmpegOptions = FFmpegOptions>
  implements IFFmpegLoader<TOptions> {
  readonly options: TOptions
  private readonly _locker: Locker = new Locker()

  constructor(options: TOptions) {
    this.options = options
  }

  private _ffmpeg: FFmpeg
  private _loadPromise: Promise<void>
  load(): Promise<void> {
    if (!this._loadPromise) {
      this._ffmpeg = createFFmpeg(this.options)
      this._loadPromise = this._ffmpeg.load().then(() => {})
    }
    return this._loadPromise
  }

  private _totalRunCount: number = 0
  run<T>(func: (ffmpeg: FFmpeg) => T|Promise<T>): Promise<T> {
    return this._locker.lock(async () => {
      await this.load()
      const ffmpeg = this._ffmpeg
      if (!ffmpeg) {
        throw new Error('Unexpected behavior')
      }
      const ffmpegWrapper = new FFmpegWrapper(ffmpeg, 5000)
      try {
        const result = await func(ffmpegWrapper)
        if (ffmpegWrapper.runInProcess) {
          throw new Error('run still in process')
        }
        return result
      } finally {
        this._totalRunCount += ffmpegWrapper.runCount
        // maximum run count = 27049, otherwise there will be memory overflow
        if (this._totalRunCount >= 15000) {
          ffmpeg.exit()
          this._ffmpeg = null
          this._loadPromise = null
          this._totalRunCount = 0
        }
      }
    })
  }
}

