/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis */
function ffmpegEncodeVorbisParams(options) {
    var _a, _b;
    const bitrate = options.bitrate || 128;
    const vbr = (_a = options.vbr) !== null && _a !== void 0 ? _a : true;
    const vbrQuality = (_b = options.vbrQuality) !== null && _b !== void 0 ? _b : 3;
    const result = ['-c:a', 'libvorbis'];
    if (vbr) {
        result.push('-q:a', vbrQuality + '');
    }
    else {
        result.push('-b:a', bitrate + 'k');
    }
    if (options.minRate) {
        result.push('-minrate', options.minRate + 'k');
    }
    if (options.maxRate) {
        result.push('-maxrate', options.maxRate + 'k');
    }
    if (options.cutoff) {
        result.push('-cutoff', options.cutoff + '');
    }
    if (options.params) {
        result.push(...options.params);
    }
    return result;
}

export { ffmpegEncodeVorbisParams };
