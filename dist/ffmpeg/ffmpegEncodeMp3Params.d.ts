export declare type Mp3Bitrate = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320;
export declare type Mp3VbrQuality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export declare type Mp3Mode = 'cbr' | 'abr' | 'vbr';
/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame */
export declare function ffmpegEncodeMp3Params(options: {
    bitrate?: Mp3Bitrate;
    mode?: Mp3Mode;
    vbrQuality?: Mp3VbrQuality;
    jointStereo?: boolean;
    params?: string[];
}): string[];
