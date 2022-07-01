import { FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerData } from '@flemist/worker-server';
export declare class FFmpegTransformClient implements IFFmpegTransformClient {
    private readonly _workerFilePath;
    options?: FFmpegClientOptions;
    private _worker;
    private _workerEventBus;
    private _ffmpegInit;
    private _ffmpegTransform;
    constructor(options?: FFmpegClientOptions);
    _initPromise: Promise<void>;
    private init;
    private _init;
    _runCount: number;
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    terminate(): Promise<void>;
}
