import { WorkerData, IWorkerClient } from '@flemist/worker-server';
import { CreateFFmpegOptions } from '@flemist/ffmpeg.wasm-st';
import { Priority } from '@flemist/priority-queue';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type FFmpegLogLevel = 'quiet' | 'panic' | 'fatal' | 'error' | 'warning' | 'info' | 'verbose' | 'debug';
export declare type FFmpegInitEvent = {
    threadId: number;
    type: string;
    message: string;
};
export declare type CreateFFmpegOptionsExt = CreateFFmpegOptions & {
    preload?: boolean;
    loglevel?: FFmpegLogLevel;
};
export declare type FFmpegOptions = Omit<CreateFFmpegOptionsExt, 'logger'> & {
    logger?: (event: WorkerData<FFmpegInitEvent>) => void;
};
export declare type FFmpegClientOptions = FFmpegOptions & {};
export declare type FFmpegInitOptions = Omit<FFmpegOptions, 'logger'> & {
    logger?: boolean;
};
export declare type FFmpegTransformArgs = {
    inputData: Uint8Array;
    inputFile?: string;
    outputFile?: string;
    params?: string[];
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare type FFmpegTransform = (args: FFmpegTransformArgs) => Promise<Uint8Array>;
export interface IFFmpegTransformClient extends IWorkerClient {
    ffmpegTransform(args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
}
