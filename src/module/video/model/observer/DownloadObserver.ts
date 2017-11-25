import { DOWNLOAD_STATE_END, IDownload, IDownloadObserver } from "../../../../api/download";
import { IVideoFile } from "../../api/VideoFile";
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
            let file: IVideoFile;
            file = {
                description: download.raw.description,
                filename: download.raw.fileName,
                image: download.raw.image,
                name: download.raw.name,
                path: download.raw.path,
                type: download.raw.type
            }
            this.videoRepository.insert(file);
        }
    }
}
