import { __awaiter } from 'tslib';
import { parentPort, threadId } from 'worker_threads';
import { createFFmpeg } from '@flemist/ffmpeg.wasm-st';
import { workerFunctionServer, messagePortToEventBus } from '@flemist/worker-server';

let ffmpegOptions;
let getFFmpegPromise;
function getFFmpeg() {
    if (!ffmpegOptions) {
        throw new Error('You should call ffmpegInit before');
    }
    if (!getFFmpegPromise) {
        const ffmpeg = createFFmpeg(ffmpegOptions);
        getFFmpegPromise = ffmpeg.load().then(() => ffmpeg);
    }
    return getFFmpegPromise;
}
function ffmpegInit(data, abortSignal, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        ffmpegOptions = Object.assign({}, data.data);
        if (ffmpegOptions.logger) {
            ffmpegOptions.logger = ({ type, message }) => {
                if (type === 'info'
                    && !(ffmpegOptions.loglevel === 'info'
                        || ffmpegOptions.loglevel === 'verbose'
                        || ffmpegOptions.loglevel === 'debug')) {
                    return;
                }
                callback({ data: { threadId, type, message } });
            };
        }
        else {
            delete ffmpegOptions.logger;
        }
        if (ffmpegOptions.preload) {
            yield getFFmpeg();
        }
        return {};
    });
}
let ffmpegTransformRunning = false;
function ffmpegTransform(data, abortSignal) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ffmpegTransformRunning) {
            throw new Error('ffmpegTransform is running');
        }
        ffmpegTransformRunning = true;
        const { data: { inputData, inputFile, outputFile, params, }, } = data;
        try {
            const ffmpeg = yield getFFmpeg();
            // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
            ffmpeg.FS('writeFile', inputFile, inputData);
            yield ffmpeg.run('-loglevel', ffmpegOptions.loglevel || 'error', // '-v', 'quiet', '-nostats', '-hide_banner',
            ...params);
            const outputData = ffmpeg.FS('readFile', outputFile);
            ffmpeg.FS('unlink', inputFile);
            ffmpeg.FS('unlink', outputFile);
            return {
                data: outputData,
                transferList: [outputData.buffer],
            };
        }
        finally {
            ffmpegTransformRunning = false;
        }
    });
}
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: ffmpegTransform,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: ffmpegInit,
});
