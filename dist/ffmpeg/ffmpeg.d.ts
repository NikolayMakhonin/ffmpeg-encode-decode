import { AudioSamples } from '../common/contracts';
import { FFmpegTransform } from './contracts';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type FFmpegDecodeArgs = {
    /** same as file extension */
    inputFormat?: string;
    channels: number;
    sampleRate: number;
};
export declare function ffmpegDecode({ ffmpegTransform, inputData, decode: { inputFormat, channels, sampleRate, }, priority, abortSignal, }: {
    ffmpegTransform: FFmpegTransform;
    inputData: Uint8Array;
    decode: FFmpegDecodeArgs;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
}): Promise<AudioSamples>;
export declare type FFmpegEncodeArgs = {
    /** same as file extension */
    outputFormat: string;
    /** force channel count */
    channels?: number;
    params?: string[];
};
export declare function ffmpegEncode({ ffmpegTransform, samples, encode: { outputFormat, channels, params, }, priority, abortSignal, }: {
    ffmpegTransform: FFmpegTransform;
    samples: AudioSamples;
    encode: FFmpegEncodeArgs;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
}): Promise<Uint8Array>;
