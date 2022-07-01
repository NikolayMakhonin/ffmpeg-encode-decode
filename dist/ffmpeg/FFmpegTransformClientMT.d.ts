import { FFmpegClientOptions, FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
import { WorkerClientMT, WorkerData } from '@flemist/worker-server';
import { FFmpegTransformClient } from './FFmpegTransformClient';
export declare class FFmpegTransformClientMT extends WorkerClientMT<FFmpegClientOptions, FFmpegTransformClient> implements IFFmpegTransformClient {
    constructor({ threads, preInit, options, }: {
        threads: number;
        preInit?: boolean;
        options?: FFmpegClientOptions;
    });
    ffmpegTransform(...args: FFmpegTransformArgs): Promise<WorkerData<Uint8Array>>;
}
