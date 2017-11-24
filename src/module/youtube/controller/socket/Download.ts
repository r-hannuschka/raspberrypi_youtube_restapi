import * as Path from "path";

import { IDownload, IDownloadObserver } from "../../../../api/download";
import { IChannel, ISocketController } from "../../../../api/socket/";
import { DownloadProvider } from "../../../../provider/DownloadProvider";

import { IYoutubeFile } from "../../api/YoutubeFile";

export class DownloadController implements IDownloadObserver, ISocketController {

    public static readonly SOCKET_CHANNEL_NAME = "youtube.download";

    private socketChannel: IChannel;

    private downloadProvider: DownloadProvider;

    private taskFile: string;

    public constructor() {
        this.downloadProvider = DownloadProvider.getInstance();
        this.downloadProvider.subscribe(this);
        this.taskFile = Path.resolve(__dirname, "../../tasks/download");
    }

    /**
     * called from Socket Manager
     *
     * @param task
     */
    public execute(socketRequest: any): void {
        const param = socketRequest.param;
        switch (socketRequest.action) {
            case "download":
                this.createDownload(param);
                break;
            case "cancel":
                this.downloadProvider
                    .cancelDownload(param);
                break;
            default:
        }
    }

    /**
     *
     * @param channel
     */
    public setChannel(channel: IChannel): void {
        this.socketChannel = channel;
    }

    /**
     *
     * @param {String} event
     * @param data
     */
    public update(download: IDownload) {
        this.socketChannel.emit(`download_provider.download${download.state}`, download);
    }

    /**
     * new client has connected to our channel
     *
     * @returns IDownloads[]
     * @memberof DownloadProvider
     */
    public onConnected() {
        return Array.from(
            this.downloadProvider.getDownloads(DownloadController.SOCKET_CHANNEL_NAME));
    }

    private createDownload(data: IYoutubeFile) {
        const path = "/media/youtube_videos";
        const uri  = `https://www.youtube.com/watch?v=${data.id}`;

        let fileName = `${data.name.replace(/\s/g, "_")}`;
        fileName = fileName.replace(/[^\w\d]/g, "");
        fileName = fileName + ".mp4";

        const raw: IYoutubeFile = {
            description: data.description,
            fileName,
            id: data.id,
            image: data.image,
            name: data.name,
            path,
            type: "video"
        };

        this.downloadProvider.initDownload(this.taskFile, uri, raw, DownloadController.SOCKET_CHANNEL_NAME );
    }
}
