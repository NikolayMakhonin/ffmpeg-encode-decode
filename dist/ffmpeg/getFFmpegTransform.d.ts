import { IFFmpegTransformClient } from './contracts';
export declare function getFFmpegTransform(client: IFFmpegTransformClient): (inputData: Uint8Array, data: {
    inputFile?: string;
    outputFile?: string;
    params?: string[];
}) => Promise<Uint8Array>;
