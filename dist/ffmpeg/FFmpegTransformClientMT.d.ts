import { FFmpegOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerData } from '@flemist/worker-server';
export declare class FFmpegTransformClientMT implements IFFmpegTransformClient {
    private readonly _workerFilePath;
    options?: FFmpegOptions;
    private readonly _clientPool;
    constructor(workerFilePath: string, options?: FFmpegOptions & {
        threads: number;
    });
    private _createClient;
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
    terminate(): Promise<void>;
}
