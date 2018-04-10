import { IFileData } from "@app-core/data/file";

export interface IVideoFileData extends IFileData
{
    description: string;

    image: string;
}
