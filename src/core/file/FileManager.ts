import { IFile, IFileData, IVideoFile,  } from "./api";
import { VideoFile } from "./model";
import { FileRepository } from "./model";

export class FileManager
{
    private static instance: FileManager = new FileManager();

    private repository: FileRepository;

    private constructor() {
        if ( FileManager.instance ) {
            throw new Error("use Filemanager:getInstance() instead.");
        }
        this.repository = FileRepository.getInstance();
    }

    public static getInstance(): FileManager {
        return this.instance;
    }

    /**
     *
     *
     * @param {(IFile | IVideoFile)} file
     * @returns {Promise<IFile>}
     * @memberof FileManager
     */
    public async add(file: IFile | IVideoFile): Promise<any>
    {
        if (file instanceof VideoFile) {
            return this.repository.addVideo(file as IVideoFile);
        }

        return this.repository.addFile(file as IFile);
    }

    public async update(file: IFile | IVideoFile, data): Promise<IFileData>
    {
        if (file instanceof VideoFile) {
            return this.repository.updateVideo(file as IVideoFile, data);
        }

        return this.repository.updateFile(file as IFile, data);
    }

    public delete(file: IFile)
    {
        // @todo implement
    }
}
