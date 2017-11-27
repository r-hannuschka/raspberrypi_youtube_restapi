import { resolve as pathResolve } from "path";
import { URL } from "url";
import { DOWNLOAD_STATE_END, IDownload, IDownloadObserver } from "../../../../api/download";
import { IFile } from "../../../../api/FileInterface";
import { IVideoFile } from "../../../../api/VideoFile";
import { DownloadProvider } from "../../../../provider/DownloadProvider";
import { Logger } from "../../../../provider/Logger";
import { VideoRepository } from "../../model/repository/VideoRepository";

export class Observer implements IDownloadObserver {

    /**
     * groupname for all downloads
     *
     * @private
     * @static
     * @memberof Observer
     */
    private static readonly DOWNLOAD_GROUP_NAME = "video_observer.image_download";

    private taskFile: string;

    /**
     * video repository
     *
     * @private
     * @type {VideoRepository}
     * @memberof Observer
     */
    private videoRepository: VideoRepository;

    /**
     * log messages
     *
     * @private
     * @type {Logger}
     * @memberof Observer
     */
    private logger: Logger;

    /**
     * download map to combine image downloads with video.
     *
     * @private
     * @type {Map<string, IVideoFile>}
     * @memberof Observer
     */
    private downloads: Map<string, IVideoFile>;

    /**
     * download provider to get images
     *
     * @private
     * @type {DownloadProvider}
     * @memberof Observer
     */
    private downloadProvider: DownloadProvider;

    /**
     * Creates an instance of Observer.
     * @memberof Observer
     */
    public constructor() {
        this.downloadProvider = DownloadProvider.getInstance();
        this.videoRepository = VideoRepository.getInstance();
        this.logger = Logger.getInstance();

        this.downloadProvider.subscribe(this, Observer.DOWNLOAD_GROUP_NAME);

        this.downloads = new Map();

        this.taskFile = pathResolve(__dirname, "../../../../tasks/image.download");
    }

    /**
     * event triggered video download has finished
     *
     * @param {IVideoFile} video
     * @returns
     * @memberof Observer
     */
    public onVideoDownloadFinished( video: IVideoFile) {

        // get image
        try {
            const image = video.image;
            const imageURL = new URL(image);

            const file: IFile = {
                fileName: imageURL.pathname.replace(/\//g, "_"),
                path: "/media/youtube_videos",
                type: "image"
            };

            const task = this.downloadProvider.initDownload(
                this.taskFile,
                imageURL.toString(),
                file,
                Observer.DOWNLOAD_GROUP_NAME,
                false
            );

            this.downloads.set(task.pid, video);
            this.downloadProvider.startDownload(task);
        } catch ( exception ) {
            /**
             * @todo we should save videos in repository before we download some more images
             */
            this.logger.log(Logger.LOG_ERROR, `Video/Observer.onVideoDownloadFinished:  ${exception.message}`);
            this.videoRepository.insert(video);
            return;
        }
    }

    /**
     *
     *
     * @param {IDownload} download
     * @memberof Observer
     */
    public update(download: IDownload) {

        console.log(download);
        if ( download.state === DOWNLOAD_STATE_END ) {
            const video = this.downloads.get(download.pid);
            video.image = download.raw.path + "/" + download.raw.fileName;
            this.downloads.delete(download.pid);
            this.videoRepository.insert(video);
        }
    }
}
