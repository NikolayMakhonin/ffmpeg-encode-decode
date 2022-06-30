/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame */
function ffmpegEncodeMp3Params(options) {
    var _a, _b, _c;
    const bitrate = options.bitrate || 128;
    const mode = (_a = options.mode) !== null && _a !== void 0 ? _a : 'cbr';
    const jointStereo = (_b = options.jointStereo) !== null && _b !== void 0 ? _b : true;
    const vbrQuality = (_c = options.vbrQuality) !== null && _c !== void 0 ? _c : 3;
    const result = [];
    if (mode === 'vbr') {
        result.push('-q:a', vbrQuality + '');
    }
    else {
        result.push('-b:a', bitrate + 'k');
    }
    if (jointStereo) {
        result.push('-joint_stereo', '1');
    }
    if (mode === 'abr') {
        result.push('-abr', '1');
    }
    if (options.params) {
        result.push(...options.params);
    }
    return result;
}

export { ffmpegEncodeMp3Params };
