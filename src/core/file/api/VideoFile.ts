import { IFile } from "./FileInterface";
import { IVideoFileData } from "./VideoFileData";

export interface IVideoFile extends IFile {

    getDescription(): string;

    getImage(): string;

    raw(): IVideoFileData;
}
