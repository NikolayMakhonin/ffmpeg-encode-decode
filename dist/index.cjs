'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ffmpeg_ffmpeg = require('./ffmpeg/ffmpeg.cjs');
var ffmpeg_ffmpegEncodeMp3Params = require('./ffmpeg/ffmpegEncodeMp3Params.cjs');
var ffmpeg_ffmpegEncodeOpusParams = require('./ffmpeg/ffmpegEncodeOpusParams.cjs');
var ffmpeg_ffmpegEncodeVorbisParams = require('./ffmpeg/ffmpegEncodeVorbisParams.cjs');
var ffmpeg_FFmpegTransformClient = require('./ffmpeg/FFmpegTransformClient.cjs');
var ffmpeg_FFmpegTransformClientMT = require('./ffmpeg/FFmpegTransformClientMT.cjs');
var ffmpeg_getFFmpegTransform = require('./ffmpeg/getFFmpegTransform.cjs');
require('tslib');
require('worker_threads');
require('@flemist/worker-server');
require('path');
require('./ffmpeg/paths.cjs');
require('@flemist/async-utils');



exports.ffmpegDecode = ffmpeg_ffmpeg.ffmpegDecode;
exports.ffmpegEncode = ffmpeg_ffmpeg.ffmpegEncode;
exports.ffmpegEncodeMp3Params = ffmpeg_ffmpegEncodeMp3Params.ffmpegEncodeMp3Params;
exports.ffmpegEncodeOpusParams = ffmpeg_ffmpegEncodeOpusParams.ffmpegEncodeOpusParams;
exports.ffmpegEncodeVorbisParams = ffmpeg_ffmpegEncodeVorbisParams.ffmpegEncodeVorbisParams;
exports.FFmpegTransformClient = ffmpeg_FFmpegTransformClient.FFmpegTransformClient;
exports.FFmpegTransformClientMT = ffmpeg_FFmpegTransformClientMT.FFmpegTransformClientMT;
exports.getFFmpegTransform = ffmpeg_getFFmpegTransform.getFFmpegTransform;