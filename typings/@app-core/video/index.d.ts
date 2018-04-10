declare module "@app-core/video" {

    import {File, IFile, IFileData} from "@app-core/data/file";

    interface IVideoFileData extends IFileData
    {
        description: string;

        image: string;
    }

    interface IVideoFile extends IFile {

        getDescription(): string;

        getImage(): string;

        raw(): IVideoFileData;
    }

    class VideoFile extends File implements IVideoFile {
        setDescription(desc: string);
        setImage(image: string);
        getDescription(): string;
        getImage(): string;
        raw(): IVideoFileData
    }

    class Video
    {
        public static getInstance(): Video;

        public create(video: IVideoFile): Promise<any>;

        public count(): Promise<number>;

        public read(type: string, start?: number, size?: number);

        public update(file: IVideoFile, data): Promise<IVideoFileData>;

        public delete(file: IVideoFile);
    }
}