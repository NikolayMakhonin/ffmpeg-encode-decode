import { AudioSamples } from '../common/contracts';
import { FFmpegTransform } from './contracts';
export declare type FFmpegDecodeArgs = {
    /** same as file extension */
    inputFormat?: string;
    channels: number;
    sampleRate: number;
};
export declare function ffmpegDecode(ffmpegTransform: FFmpegTransform, inputData: Uint8Array, { inputFormat, channels, sampleRate, }: FFmpegDecodeArgs): Promise<AudioSamples>;
export declare type FFmpegEncodeArgs = {
    /** same as file extension */
    outputFormat: string;
    /** force channel count */
    channels?: number;
    params?: string[];
};
export declare function ffmpegEncode(ffmpegTransform: FFmpegTransform, samples: AudioSamples, { outputFormat, channels, params, }: FFmpegEncodeArgs): Promise<Uint8Array>;
