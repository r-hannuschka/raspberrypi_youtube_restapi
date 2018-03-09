declare module "@app-core/file" {

    interface IFileData 
    {
        description?: string;
        file: string;
        id?: number;
        image?: string;
        name: string;
        type: string;
    }

    class FileManager
    {
        public static getInstance(): FileManager;
        public add(file: File): Promise<any>;
        public update(file: File, data): Promise<File>;
        public delete(file: File);
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
    }

    class VideoFile extends File {
        setDescription(desc: string);
        setImage(image: File | string);
        getDescription(): string;
        getImage(): File
    }
}