import { WorkerClientPool } from '@flemist/worker-server';
import { FFmpegTransformClient } from './FFmpegTransformClient.mjs';
import 'tslib';
import './paths.cjs';

class FFmpegTransformClientPool extends WorkerClientPool {
    constructor({ threadsPool, preInit, options, }) {
        super({
            threadsPool,
            createClient() {
                return new FFmpegTransformClient({
                    preInit,
                    options: options,
                });
            },
            preInit,
        });
    }
    ffmpegTransform(args) {
        return this.use(1, ([client]) => {
            return client.ffmpegTransform(args);
        }, args.priority, args.abortSignal);
    }
}

export { FFmpegTransformClientPool };
