import {
  FFmpeg,
  FSMethodArgs,
  FSMethodNames,
  FSMethodReturn,
  LogCallback,
  ProgressCallback,
} from '@flemist/ffmpeg.wasm-st'

export class FFmpegWrapper implements FFmpeg {
  private _ffmpeg: FFmpeg
  maxRunCount: number

  constructor(ffmpeg: FFmpeg, maxRunCount: number) {
    this._ffmpeg = ffmpeg
    this.maxRunCount = maxRunCount
  }

  FS<Method extends FSMethodNames>(
    method: Method,
    ...args: FSMethodArgs[Method]
  ): FSMethodReturn[Method] {
    return this._ffmpeg.FS(method, ...args)
  }

  exit(): void {
    return this._ffmpeg.exit()
  }

  isLoaded(): boolean {
    return this._ffmpeg.isLoaded()
  }

  load(): Promise<void> {
    return this._ffmpeg.load()
  }

  runCount: number = 0
  runInProcess: boolean = false
  run(...args: string[]): Promise<void> {
    if (this.runInProcess) {
      throw new Error('run parallel is not supported')
    }
    try {
      this.runInProcess = true
      this.runCount++
      if (this.runCount > this.maxRunCount) {
        throw new Error(`run count > ${this.maxRunCount}`)
      }
      return this._ffmpeg.run(...args)
    } finally {
      this.runInProcess = false
    }
  }

  setLogger(log: LogCallback): void {
    this._ffmpeg.setLogger(log)
  }

  setLogging(logging: boolean): void {
    this._ffmpeg.setLogging(logging)
  }

  setProgress(progress: ProgressCallback): void {
    this._ffmpeg.setProgress(progress)
  }
}
