import { IFile } from "@app-core/data/file";
import { IVideoFileData } from "./VideoFileData";

export interface IVideoFile extends IFile {

    getDescription(): string;

    getImage(): string;

    raw(): IVideoFileData;
}
