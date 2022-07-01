'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer = require('@flemist/worker-server');
var ffmpeg_FFmpegTransformClient = require('./FFmpegTransformClient.cjs');
require('tslib');
require('./paths.cjs');

class FFmpegTransformClientMT extends workerServer.WorkerClientMT {
    constructor({ threads, preInit, options, }) {
        super({
            threads,
            createClient(options) {
                return new ffmpeg_FFmpegTransformClient.FFmpegTransformClient({
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

exports.FFmpegTransformClientMT = FFmpegTransformClientMT;
