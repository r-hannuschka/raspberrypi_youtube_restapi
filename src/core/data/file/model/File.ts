import { IFile, IFileData } from "../api";

export class File implements IFile {

    private id: number;

    private file: string;

    private name: string;

    private path: string;

    public setFile(name: string): void {
        this.file = name;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setPath(path: string): void {
        this.path = path;
    }

    public getFile(): string {
        return this.file;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getPath(): string {
        return this.path;
    }

    public raw(): IFileData {
        return {
            file: this.getFile(),

            id: this.getId(),

            name: this.getName(),

            path: this.getPath()
        }
    }
}
