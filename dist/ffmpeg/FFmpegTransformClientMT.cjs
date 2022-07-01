'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var ffmpeg_FFmpegTransformClient = require('./FFmpegTransformClient.cjs');
var asyncUtils = require('@flemist/async-utils');
require('worker_threads');
require('@flemist/worker-server');
require('path');
require('./paths.cjs');

class FFmpegTransformClientMT {
    constructor(options) {
        this.options = options || {};
        this._clientPool = new asyncUtils.ObjectPool({
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
        return new ffmpeg_FFmpegTransformClient.FFmpegTransformClient(this.options);
    }
    ffmpegTransform(...args) {
        return this._clientPool.use((client) => {
            return client.ffmpegTransform(...args);
        });
    }
    terminate() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
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

exports.FFmpegTransformClientMT = FFmpegTransformClientMT;
