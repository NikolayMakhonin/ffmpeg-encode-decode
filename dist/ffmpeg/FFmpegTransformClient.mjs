import { __awaiter } from 'tslib';
import { Worker } from 'worker_threads';
import { workerToEventBus, workerFunctionClient } from '@flemist/worker-server';
import path from 'path';

function getWorkerFFmpegInit(workerEventBus) {
    return workerFunctionClient({
        eventBus: workerEventBus,
        name: 'ffmpegInit',
    });
}
function getWorkerFFmpegTransform(workerEventBus) {
    return workerFunctionClient({
        eventBus: workerEventBus,
        name: 'ffmpegTransform',
    });
}
class FFmpegTransformClient {
    constructor(workerFilePath, options) {
        this._worker = null;
        this._workerEventBus = null;
        this._runCount = 0;
        this._workerFilePath = workerFilePath;
        this.options = options || {};
        if (this.options.preload) {
            void this.init();
        }
    }
    init() {
        if (!this._initPromise) {
            this._initPromise = this._init();
        }
        return this._initPromise;
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._worker = new Worker(path.resolve(this._workerFilePath));
            this._workerEventBus = workerToEventBus(this._worker);
            this._ffmpegInit = getWorkerFFmpegInit(this._workerEventBus);
            this._ffmpegTransform = getWorkerFFmpegTransform(this._workerEventBus);
            const options = Object.assign(Object.assign({}, this.options), { logger: !!this.options.logger });
            yield this._ffmpegInit({
                data: options,
            }, null, (event) => {
                this.options.logger(event);
            });
        });
    }
    ffmpegTransform(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            try {
                this._runCount++;
                const result = yield this._ffmpegTransform({
                    data: args,
                    transferList: args[0].buffer instanceof SharedArrayBuffer
                        ? null
                        : [args[0].buffer],
                });
                return result;
            }
            finally {
                if (this._runCount >= 15000) { // default: 15000, maximum 27054 according to stress test
                    const runCount = this._runCount;
                    yield this.terminate();
                    yield this.init();
                    console.log(`Unload ffmpegTransform worker after ${runCount} calls`);
                }
            }
        });
    }
    terminate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._worker) {
                yield ((_a = this._worker) === null || _a === void 0 ? void 0 : _a.terminate());
                this._worker = null;
                this._workerEventBus = null;
                this._runCount = 0;
                this._initPromise = null;
                this._ffmpegInit = null;
                this._ffmpegTransform = null;
            }
        });
    }
}

export { FFmpegTransformClient };
