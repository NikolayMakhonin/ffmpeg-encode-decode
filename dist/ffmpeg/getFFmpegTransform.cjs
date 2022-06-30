'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

function getFFmpegTransform(client) {
    return function ffmpegTransform(...args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const result = yield client.ffmpegTransform(...args);
            return result.data;
        });
    };
}

exports.getFFmpegTransform = getFFmpegTransform;
