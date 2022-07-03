'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer = require('@flemist/worker-server');
var ffmpeg_FFmpegTransformClient = require('./FFmpegTransformClient.cjs');
require('tslib');
require('./paths.cjs');

class FFmpegTransformClientPool extends workerServer.WorkerClientPool {
    constructor({ threadsPool, preInit, options, }) {
        super({
            threadsPool,
            createClient() {
                return new ffmpeg_FFmpegTransformClient.FFmpegTransformClient({
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

exports.FFmpegTransformClientPool = FFmpegTransformClientPool;
