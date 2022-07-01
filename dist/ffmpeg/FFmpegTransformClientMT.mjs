import { WorkerClientMT } from '@flemist/worker-server';
import { FFmpegTransformClient } from './FFmpegTransformClient.mjs';
import 'tslib';
import './paths.cjs';

class FFmpegTransformClientMT extends WorkerClientMT {
    constructor({ threads, preInit, options, }) {
        super({
            threads,
            createClient(options) {
                return new FFmpegTransformClient({
                    preInit,
                    options: this.options,
                });
            },
            options: options || {},
            preInit,
        });
    }
    ffmpegTransform(...args) {
        return this.use((client) => {
            return client.ffmpegTransform(...args);
        });
    }
}

export { FFmpegTransformClientMT };
