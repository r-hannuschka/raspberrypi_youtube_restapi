import { DownloadManager, TaskFactory } from "../../../libs/download";
import { IVideoFile } from "../api/VideoFile";

export class Download
{
    public static readonly GROUP_NAME = "youtube.download";

    /**
     * start video download
     *
     * @param {IVideoFile} file
     * @memberof DownloadManager
     */
    public static download(file: IVideoFile) {
    }

    public static cancelDownload(task) {
    }
}
