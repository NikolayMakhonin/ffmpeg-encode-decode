import { FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerClientPool, WorkerData } from '@flemist/worker-server';
import { FFmpegTransformClient } from './FFmpegTransformClient';
import { IPool } from '@flemist/time-limits';
export declare class FFmpegTransformClientPool extends WorkerClientPool<FFmpegTransformClient> implements IFFmpegTransformClient {
    constructor({ threadsPool, preInit, options, }: {
        threadsPool: IPool;
        preInit?: boolean;
        options?: FFmpegClientOptions;
    });
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
}
