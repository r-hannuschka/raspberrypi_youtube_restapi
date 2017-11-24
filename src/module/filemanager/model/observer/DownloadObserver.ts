import { DOWNLOAD_STATE_END, IDownload, IDownloadObserver } from "../../../../api/download";
import { IFile } from "../../api/FileInterface";
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
                name: download.param.name,
                path: download.param.dir
            }
            this.videoRepository.insert(file);
        }
    }
}
