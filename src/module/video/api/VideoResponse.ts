import { IVideoFile } from "./../../../api/VideoFile";

export interface IVideoResult {

    total: number;

    videos: IVideoFile[];
}
