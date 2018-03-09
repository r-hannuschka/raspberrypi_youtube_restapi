import { IFileData } from "./FileDataInterface";

export interface IVideoFileData extends IFileData
{
    description: string;

    image: string;
}
