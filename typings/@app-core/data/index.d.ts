declare module "@app-core/data/file" {

    interface IFileData 
    {
        description?: string;
        file: string;
        id?: number;
        image?: string;
        path: string;
        name: string;
        type: string;
    }

    interface IFile
    {
        getFile(): string;
        getId(): number;
        getName(): string;
        getPath(): string;
        raw(): IFileData
    }

    class File {
        getFile(): string
        getId(): number;
        getName(): string;
        getPath(): string;
        setFile(f: string);
        setId(id: number): number;
        setName(name: string);
        setPath(path: string);
        raw(): IFileData;
    }
}