import { downloadImageFile, IDownloadData } from "rh-download";
import { Validator } from "rh-utils";
import { FILE_TYPE_VIDEO, IFile, IFileData,  } from "./api";
import { File, FileRepository } from "./model";

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
     * @param {IFileData} data
     * @returns {IFile}
     * @memberof FileManager
     */
    public createFile(data: IFileData): IFile
    {
        const file: File = new File();

        file.setDescription(data.description);
        file.setFile(data.file);
        file.setImage(data.image);
        file.setName(data.name);
        file.setType(data.type);

        return file;
    }

    /**
     * add new file to repository
     * check if file has an video, validate image url
     * and download image if possible.
     *
     * @param {IFile} file
     * @returns {IFile}
     * @memberof FileManager
     */
    public async add(file: File): Promise<IFile>
    {
        const added = await this.repository.add(file);
        file.setId(added.info.insertId);

        if ( file.getType() === FILE_TYPE_VIDEO ) {
            Validator.urlExists(file.getImage())
                .then( () => {
                    return downloadImageFile(file.getName(), file.getImage());
                })
                .then( (data: IDownloadData) => {
                    // @todo implement
                })
                .catch( (err) => {
                    console.log ( err );
                });
        }
        return file;
    }

    public async update(file: IFileData, data): Promise<IFileData>
    {
        // @todo implement
        return Promise.resolve(file);
    }

    public delete(file: IFile)
    {
        // not empty
    }
}
