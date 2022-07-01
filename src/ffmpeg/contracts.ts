// see: https://github.com/ffmpegwasm/ffmpeg.wasm-core/blob/8f39fb6c8a07faada0b7fc6fa7a80267754347a7/fftools/cmdutils.c#L876
// see: https://superuser.com/a/438280
import {WorkerData, IWorkerClient} from '@flemist/worker-server'
import {CreateFFmpegOptions} from '@flemist/ffmpeg.wasm-st'

export type FFmpegLogLevel = 'quiet' | 'panic' | 'fatal' | 'error' | 'warning' | 'info' | 'verbose' | 'debug'

export type FFmpegInitEvent = {threadId: number, type: string, message: string}

export type CreateFFmpegOptionsExt = CreateFFmpegOptions & {
  preload?: boolean,
  loglevel?: FFmpegLogLevel,
}

export type FFmpegOptions = Omit<CreateFFmpegOptionsExt, 'logger'> & {
  logger?: (event: WorkerData<FFmpegInitEvent>) => void
}

export type FFmpegClientOptions = FFmpegOptions & {

}

export type FFmpegInitOptions = Omit<FFmpegOptions, 'logger'> & { logger?: boolean }

export type FFmpegTransformArgs = [
  inputData: Uint8Array,
  data: {
    inputFile?: string,
    outputFile?: string,
    params?: string[],
  },
]

export type FFmpegTransform = (...args: FFmpegTransformArgs) => Promise<Uint8Array>

// export interface IFFmpegRunner<TOptions extends CreateFFmpegOptions = FFmpegOptions> {
//   options: TOptions
//   load(): Promise<void>
//   run<T>(func: (ffmpeg: FFmpeg) => T|Promise<T>): Promise<T>
// }

export interface IFFmpegTransformClient extends IWorkerClient {
  ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
}
