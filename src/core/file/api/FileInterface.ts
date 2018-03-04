import { IFileData } from "rh-download";

export interface IFile {

    getDescription(): string;

    getFile(): string;

    getId(): number;

    getName(): string;

    getTitle(): string;

    getType(): string;

    getImage(): string;

    raw(): IFileData
}
