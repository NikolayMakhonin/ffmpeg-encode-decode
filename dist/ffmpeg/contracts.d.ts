import { WorkerData } from '@flemist/worker-server';
import { CreateFFmpegOptions } from '@flemist/ffmpeg.wasm-st';
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
export declare type FFmpegTransformArgs = [
    inputData: Uint8Array,
    data: {
        inputFile?: string;
        outputFile?: string;
        params?: string[];
    }
];
export declare type FFmpegTransform = (...args: FFmpegTransformArgs) => Promise<Uint8Array>;
export interface IFFmpegTransformClient {
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    terminate(): Promise<void>;
}
