import { FFmpegTransformArgs, IFFmpegTransformClient } from './contracts';
export declare function getFFmpegTransform(client: IFFmpegTransformClient): (args: FFmpegTransformArgs) => Promise<Uint8Array>;
