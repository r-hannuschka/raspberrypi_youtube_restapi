import { IVideoFile, IVideoFileData } from "./api";
import { VideoRepository } from "./model/repository/VideoRepository";

export class Video
{
    private static instance: Video = new Video();

    private repository: VideoRepository;

    private constructor() {
        if ( Video.instance ) {
            throw new Error("use VideoProvider:getInstance() instead.");
        }
        this.repository = VideoRepository.getInstance();
    }

    public static getInstance(): Video {
        return this.instance;
    }

    /**
     *
     *
     * @param {IVideoFile} video
     * @returns {Promise<IFile>}
     * @memberof FileManager
     */
    public async create(video: IVideoFile): Promise<any>
    {
        return this.repository.add(video);
    }

    public async count(): Promise<number>
    {
        return this.repository.getTotal();
    }

    public async read(type: string, start, index)
    {
        return this.repository.list(type, start, index);
    }

    public async update(file: IVideoFile, data): Promise<IVideoFileData>
    {
        return this.repository.update(file, data);
    }

    public delete(file: IVideoFile)
    {
        // @todo implement
    }
}
