import * as Path from "path";
import { Observer } from "../../../../api/Observer";
import { IChannel, ISocketController } from "../../../../api/socket/";
import { DownloadProvider } from "../../../../provider/DownloadProvider";

export class DownloadController implements Observer, ISocketController {

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
        const data = socketRequest.data;
        switch (socketRequest.action) {
            case "download":
                this.createDownload(data);
                break;
            case "cancel":
                this.downloadProvider.cancelDownload(data);
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
    public notify(event: string, data: any) {
        this.socketChannel.emit(event, data);
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

    private createDownload(data) {
        const dir = "/media/youtube_videos";
        const uri = `https://www.youtube.com/watch?v=${data.id}`;

        let name = `${data.name.replace(/\s/g, "_")}`;
        name = name.replace(/[^\w\d]/g, "");
        name = name + ".mp4";

        const param = { dir, name, uri };

        this.downloadProvider.initDownload(this.taskFile, param, DownloadController.SOCKET_CHANNEL_NAME );
    }
}
