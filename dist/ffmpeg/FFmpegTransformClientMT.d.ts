import { FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerData } from '@flemist/worker-server';
export declare class FFmpegTransformClientMT implements IFFmpegTransformClient {
    options?: FFmpegClientOptions;
    private readonly _clientPool;
    constructor(options?: FFmpegClientOptions & {
        threads: number;
    });
    private _createClient;
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    terminate(): Promise<void>;
}
