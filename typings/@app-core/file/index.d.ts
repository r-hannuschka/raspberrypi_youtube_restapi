declare module '@app-core/file' {

    interface IFile 
    {

        getDescription(): string;

        getFile(): string;

        getId(): number;

        getTitle(): string;

        getType(): string;

        getPreviewImage(): string;
    }

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

        public createFile(data: IFileData) : IFile;

        /**
         * add new file to repository
         * check if file has an video, validate image url
         * and download image if possible.
         * 
         * @param {IFile} file 
         * @returns {IFile} 
         * @memberof FileManager
         */
        public add(file: IFile): Promise<IFile>;

        public update(file: IFile, data): Promise<IFile>;

        public delete(file: IFile);
    }
}