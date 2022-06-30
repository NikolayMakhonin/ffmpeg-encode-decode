import { FFmpegOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerData } from '@flemist/worker-server';
export declare class FFmpegTransformClient implements IFFmpegTransformClient {
    private readonly _workerFilePath;
    options?: FFmpegOptions;
    private _worker;
    private _workerEventBus;
    private _ffmpegInit;
    private _ffmpegTransform;
    constructor(workerFilePath: string, options?: FFmpegOptions);
    _initPromise: Promise<void>;
    private init;
    private _init;
    _runCount: number;
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    terminate(): Promise<void>;
}
