import { __awaiter } from 'tslib';
import { WorkerClient, workerFunctionClient } from '@flemist/worker-server';
import { ffmpegTransformWorkerPath } from './paths.cjs';

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
class FFmpegTransformClient extends WorkerClient {
    constructor({ preInit, options, }) {
        super({
            workerFilePath: ffmpegTransformWorkerPath,
            options: options || {},
            preInit,
        });
        this._runCount = 0;
    }
    _init(workerEventBus) {
        return __awaiter(this, void 0, void 0, function* () {
            this._ffmpegInit = getWorkerFFmpegInit(workerEventBus);
            this._ffmpegTransform = getWorkerFFmpegTransform(workerEventBus);
            const options = Object.assign(Object.assign({}, this.options), { logger: !!this.options.logger });
            yield this._ffmpegInit({
                data: options,
            }, null, (event) => {
                this.options.logger(event);
            });
        });
    }
    ffmpegTransform(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            try {
                this._runCount++;
                const result = yield this._ffmpegTransform({
                    data: args,
                    transferList: [args.inputData.buffer],
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
    _terminate() {
        this._runCount = 0;
        this._ffmpegInit = null;
        this._ffmpegTransform = null;
    }
}

export { FFmpegTransformClient };
