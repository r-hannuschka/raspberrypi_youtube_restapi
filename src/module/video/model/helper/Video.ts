import { URL } from "url";
import { DOWNLOAD_STATE_END, IDownload, DownloadManager} from "../../../../libs/download";
import { IFile } from "../../../../api/FileInterface";
import { IVideoFile } from "../../../../api/VideoFile";
import { AppConfig } from "../../../../model/AppConfig";
import { Logger } from "../../../../libs/log";
import { VideoRepository } from "../../model/repository/VideoRepository";

export class VideoHelper implements IDownloadObserver
{
    /**
     * groupname for all downloads
     *
     * @private
     * @static
     * @memberof Observer
     */
    private static readonly DOWNLOAD_GROUP_NAME = "video_observer.image_download";

    private static readonly instance: VideoHelper = new VideoHelper();

    /**
     * path to download task file
     *
     * @private
     * @type {string}
     * @memberof VideoImageDownloader
     */
    private taskFile: string;

    /**
     * download map to combine image downloads with video.
     *
     * @private
     * @type {Map<string, IVideoFile>}
     * @memberof Observer
     */
    private downloads: Map<string, IVideoFile>;

    private videoRepository: VideoRepository;

    /**
     *
     *
     * @private
     * @type {Logger}
     * @memberof VideoImageDownloader
     */
    private logger: Logger;

    /**
     * download provider to get images
     *
     * @private
     * @type {DownloadProvider}
     * @memberof Observer
     */
    private downloadProvider: DownloadProvider;

    private mediaDir: string;

    private mediaUrl: string;

    public constructor() {

        if ( VideoHelper.instance ) {
            throw new Error("use VideoHelper.getInstance()");
        }

        this.downloadProvider = DownloadManager.getInstance();
        this.videoRepository = VideoRepository.getInstance();

        this.downloadProvider.subscribe(this, VideoHelper.DOWNLOAD_GROUP_NAME);
        this.downloads = new Map();
        this.logger = Logger.getInstance();

        this.mediaDir = AppConfig.get("paths.media.image");
        this.mediaUrl = AppConfig.get("web.media.image");
    }

    public static getInstance() {
        return this.instance;
    }

    public async update(task: IDownload) {
        const download = task;
        if ( download.state === DOWNLOAD_STATE_END ) {
            const video: IVideoFile = this.downloads.get(download.pid);
            await this.videoRepository.update(video, {
                image: `${this.mediaUrl}/${download.raw.fileName}`
            });
            this.downloads.delete(download.pid);
        }
    }

    public async addVideo(video: IVideoFile) {

        const insertData = await this.videoRepository.insert(video);
        video.video_id = insertData.info.insertId;

        const task: IDownload = this.createImageDownloadTask(video.image);

        if ( task ) {
            this.downloads.set(task.pid, video);
            this.downloadProvider.startDownload(task);
        }
    }

    private createImageDownloadTask($image: string): IDownload | null {

        let task: IDownload | null = null;

        // get image
        try {
            const image = $image;
            const imageURL = new URL(image);

            const file: IFile = {
                fileName: imageURL.pathname.replace(/\//g, "_"),
                path: `${this.mediaDir}`,
                type: "image"
            };

            task = this.downloadProvider.initDownload(
                this.taskFile,
                imageURL.toString(),
                file,
                VideoHelper.DOWNLOAD_GROUP_NAME,
                false
            );

        } catch ( exception ) {
            this.logger.log(Logger.LOG_ERROR, `Video/Observer.onVideoDownloadFinished:  ${exception.message}`);
        }

        return task;
    }
}
