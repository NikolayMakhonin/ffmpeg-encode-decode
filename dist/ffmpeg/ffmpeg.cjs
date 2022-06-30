'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

function ffmpegDecode(ffmpegTransform, inputData, { inputFormat, channels, sampleRate, }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const inputFile = 'input' + (inputFormat ? '.' + inputFormat : '');
        const outputFile = 'output.pcm';
        // decodeInputSize += inputData.byteLength
        const outputData = yield ffmpegTransform(inputData, {
            inputFile,
            outputFile,
            params: [
                '-i', inputFile,
                '-f', 'f32le',
                '-ac', channels + '',
                '-ar', sampleRate + '',
                '-acodec', 'pcm_f32le',
                outputFile,
            ],
        });
        // decodeOutputSize += outputData.byteLength
        // decodeCount++
        // console.log(`Decode: ${decodeCount}, ${decodeInputSize}, ${decodeOutputSize}`)
        return {
            data: new Float32Array(outputData.buffer, outputData.byteOffset, outputData.byteLength / 4),
            channels,
            sampleRate,
        };
    });
}
function ffmpegEncode(ffmpegTransform, samples, { outputFormat, channels, params, }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const inputFile = 'input.pcm';
        const outputFile = 'output' + (outputFormat ? '.' + outputFormat : '');
        const pcmData = new Uint8Array(samples.data.buffer, samples.data.byteOffset, samples.data.byteLength);
        // encodeInputSize += pcmData.byteLength
        // docs: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
        const outputData = yield ffmpegTransform(pcmData, {
            inputFile,
            outputFile,
            params: [
                '-f', 'f32le',
                '-ac', samples.channels + '',
                '-ar', samples.sampleRate + '',
                '-i', 'input.pcm',
                '-ac', (channels || samples.channels) + '',
                ...params || [],
                outputFile,
            ],
        });
        // encodeOutputSize += outputData.byteLength
        // encodeCount++
        // console.log(`Encode: ${encodeCount}, ${encodeInputSize}, ${encodeOutputSize}`)
        return outputData;
    });
}

exports.ffmpegDecode = ffmpegDecode;
exports.ffmpegEncode = ffmpegEncode;
