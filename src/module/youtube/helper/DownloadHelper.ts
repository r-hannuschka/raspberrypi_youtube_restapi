import { resolve as pathResolve } from "path";
import { IDownload } from "../../../api/download";
import { IVideoFile } from "../../../api/VideoFile";
import { DownloadProvider } from "../../../provider/DownloadProvider";

export class DownloadHelper
{
    public static readonly GROUP_NAME = "youtube.download";

    private static readonly instance: DownloadHelper = new DownloadHelper();

    private downloadProvider: DownloadProvider;

    private downloadTask: string;

    /**
     * Creates an instance of DownloadHelper.
     * @memberof DownloadHelper
     */
    public constructor() {

        if ( DownloadHelper.instance ) {
            throw new Error("use DownloadHelper.getInstance() ");
        }

        this.downloadProvider = DownloadProvider.getInstance();
        this.downloadTask     = pathResolve(__dirname, "../tasks/video.download");
    }

    /**
     *
     *
     * @static
     * @returns {DownloadHelper}
     * @memberof DownloadHelper
     */
    public static getInstance(): DownloadHelper {
        return this.instance;
    }

    /**
     * start video download
     *
     * @param {IVideoFile} file
     * @memberof DownloadManager
     */
    public download(file: IVideoFile) {
        const path = "/media/youtube_videos";
        const uri  = `https://www.youtube.com/watch?v=${file.id}`;

        let fileName = `${file.name.replace(/\s/g, "_")}`;
        fileName = fileName.replace(/[^\w\d]/g, "");
        fileName = fileName + ".mp4";

        file.path = path;
        file.fileName = fileName;

        const videoDownload = this.createVideoDownload(uri, file);
        this.downloadProvider.startDownload(videoDownload);
    }

    /**
     * create video download
     *
     * @private
     * @param {any} uri
     * @param {any} file
     * @returns {IDownload}
     * @memberof DownloadManager
     */
    private createVideoDownload(uri, file): IDownload {
        const task: IDownload = this.downloadProvider.initDownload(
            this.downloadTask, uri, file, DownloadHelper.GROUP_NAME, false);
        return task;
    }
}
