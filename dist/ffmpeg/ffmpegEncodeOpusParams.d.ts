export declare type OpusBitrate = 6 | 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128 | 160 | 192 | 256;
export declare type OpusCompression = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export declare type OpusApplication = 'voip' | 'audio' | 'lowdelay';
export declare type OpusVbr = 'off' | 'on' | 'constrained';
export declare type OpusCutoff = 0 | 4000 | 6000 | 8000 | 12000 | 20000;
export declare type OpusFrameDurationMs = 2.5 | 5 | 10 | 20 | 40 | 60;
/**
 * docs: http://ffmpeg.org/ffmpeg-codecs.html#libopus-1
 * !! Attention opus encoder heavily distorts samples data
 */
export declare function ffmpegEncodeOpusParams(options: {
    bitrate: OpusBitrate;
    vbr?: OpusVbr;
    compression?: OpusCompression;
    application?: OpusApplication;
    cutoff?: OpusCutoff;
    frameDuration?: OpusFrameDurationMs;
    params?: string[];
}): string[];
