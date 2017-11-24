import { DOWNLOAD_STATE_END, IDownload, IDownloadObserver } from "../../../../api/download";
import { IFile } from "../../../../api/FileInterface";
import { VideoRepository } from "../../model/repository/VideoRepository";

export class DownloadObserver implements IDownloadObserver
{
    private videoRepository: VideoRepository;

    public constructor() {
        this.videoRepository = VideoRepository.getInstance();
    }

    public update(download: IDownload) {

        if ( download.state === DOWNLOAD_STATE_END ) {
            // save data to database
            let file: IFile;
            file = {
                description: download.raw.description,
                image: download.raw.image,
                name: download.raw.name,
                path: download.raw.path,
                type: download.raw.type
            }
            this.videoRepository.insert(file);
        }
    }
}
