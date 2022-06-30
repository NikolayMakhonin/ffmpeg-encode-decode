'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1
 * !! Attention opus encoder heavily distorts samples data
 */
function ffmpegEncodeOpusParams(options) {
    return [
        '-c:a', 'libopus',
        '-b:a', options.bitrate + 'k',
        '-vbr', options.vbr || 'on',
        '-compression_level', (options.compression || 10) + '',
        '-frame_duration', (options.frameDuration || 20) + '',
        '-application', options.application || 'audio',
        '-cutoff', (options.cutoff || 0) + '',
        ...options.params || [],
    ];
}

exports.ffmpegEncodeOpusParams = ffmpegEncodeOpusParams;
