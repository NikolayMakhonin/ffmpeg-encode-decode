export declare type VorbisBitrate = 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128 | 160 | 192 | 256;
export declare type VorbisVbrQuality = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export declare type VorbisCutoff = 0 | 4000 | 6000 | 8000 | 12000 | 20000;
/** docs: http://ffmpeg.org/ffmpeg-codecs.html#libvorbis */
export declare function ffmpegEncodeVorbisParams(options: {
    bitrate?: VorbisBitrate;
    vbr?: boolean;
    vbrQuality?: VorbisVbrQuality;
    minRate?: VorbisBitrate;
    maxRate?: VorbisBitrate;
    cutoff?: VorbisCutoff;
    params?: string[];
}): string[];
