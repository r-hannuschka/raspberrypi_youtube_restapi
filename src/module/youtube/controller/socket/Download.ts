import {
    DOWNLOAD_STATE_END,
    EVENT_VIDEO_DOWNLOAD_FINISHED,
    IDownload,
    IDownloadObserver
} from "../../../../api/download";

import { IChannel, ISocketController } from "../../../../api/socket/";
import { IVideoFile } from "../../../../api/VideoFile";
import { DownloadProvider } from "../../../../provider/DownloadProvider";
import { PubSub } from "../../../../provider/PubSub";
import { DownloadHelper } from "../../helper/DownloadHelper";

export class DownloadController implements IDownloadObserver, ISocketController {

    private socketChannel: IChannel;

    private downloadProvider: DownloadProvider;

    private downloadHelper: DownloadHelper;

    public constructor() {
        this.downloadProvider = DownloadProvider.getInstance();
        this.downloadProvider.subscribe(this, DownloadHelper.GROUP_NAME);
        this.downloadHelper = DownloadHelper.getInstance();
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
                this.downloadHelper
                    .download(param);
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

        if ( download.state === DOWNLOAD_STATE_END ) {
            PubSub.publish(EVENT_VIDEO_DOWNLOAD_FINISHED, download.raw as IVideoFile);
        }

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
            this.downloadProvider.getDownloads(DownloadHelper.GROUP_NAME));
    }
}
