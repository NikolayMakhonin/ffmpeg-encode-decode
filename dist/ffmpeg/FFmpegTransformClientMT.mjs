import { __awaiter } from 'tslib';
import { FFmpegTransformClient } from './FFmpegTransformClient.mjs';
import { ObjectPool } from '@flemist/async-utils';
import 'worker_threads';
import '@flemist/worker-server';
import 'path';
import './paths.cjs';

class FFmpegTransformClientMT {
    constructor(options) {
        this.options = options || {};
        this._clientPool = new ObjectPool({
            maxSize: options.threads || 1,
            holdObjects: true,
            create: () => {
                return this._createClient();
            },
            destroy: (client) => {
                return client.terminate();
            },
        });
        if (this.options.preload) {
            void this._clientPool.allocate();
        }
    }
    _createClient() {
        return new FFmpegTransformClient(this.options);
    }
    ffmpegTransform(...args) {
        return this._clientPool.use((client) => {
            return client.ffmpegTransform(...args);
        });
    }
    terminate() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this._clientPool.availableObjects.forEach(o => {
                promises.push(o.terminate());
            });
            this._clientPool.holdObjects.forEach(o => {
                promises.push(o.terminate());
            });
            yield Promise.all(promises);
        });
    }
}

export { FFmpegTransformClientMT };
