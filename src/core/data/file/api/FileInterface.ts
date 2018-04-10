import { IFileData } from "./FileDataInterface";

export interface IFile {

    getFile(): string;

    getId(): number;

    getName(): string;

    getPath(): string;

    raw(): IFileData
}
