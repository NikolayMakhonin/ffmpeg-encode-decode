import { FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { IWorkerEventBus, WorkerClient, WorkerData } from '@flemist/worker-server';
export declare class FFmpegTransformClient extends WorkerClient<FFmpegClientOptions> implements IFFmpegTransformClient {
    private _runCount;
    private _ffmpegInit;
    private _ffmpegTransform;
    constructor({ preInit, options, }: {
        preInit: boolean;
        options?: FFmpegClientOptions;
    });
    protected _init(workerEventBus: IWorkerEventBus): Promise<void>;
    ffmpegTransform(args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    protected _terminate(): void;
}
