import { __awaiter } from 'tslib';

function getFFmpegTransform(client) {
    return function ffmpegTransform(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield client.ffmpegTransform(...args);
            return result.data;
        });
    };
}

export { getFFmpegTransform };
