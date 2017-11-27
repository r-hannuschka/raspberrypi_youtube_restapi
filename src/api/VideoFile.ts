import { IFile } from "./FileInterface";

export interface IVideoFile extends IFile {

    video_id?: number;

    name: string;

    description: string;

    image: string;
}
