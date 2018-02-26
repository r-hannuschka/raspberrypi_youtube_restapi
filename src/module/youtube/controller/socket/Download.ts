import { IChannel, ISocketController } from "../../../../libs/socket";
import { DownloadManager, DownloadTask, TaskFactory } from "../../../../libs/download"
import { DOWNLOAD_GROUP_NAME, IVideoFile, SOCKET_GROUP_NAME } from '../../api';

export class DownloadController implements ISocketController {

    private socketChannel: IChannel;

    private downloadManager: DownloadManager;

    public constructor() {
        this.downloadManager = DownloadManager.getInstance();
        this.registerSubscriptions();
    }

    /**
     * 
     * @private
     * @memberof DownloadController
     */
    private registerSubscriptions() {
        this.downloadManager.subscribe( (data: any) => {
            this.socketChannel.emit(`download_provider.download${data.state}`, data);
        }, DOWNLOAD_GROUP_NAME);
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
                this.downloadAction(param);
                break;
            case "cancel":
                this.cancelAction(param);
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
     * new client has connected to our channel
     *
     * @returns IDownloads[]
     * @memberof DownloadProvider
     */
    public onConnected() {

        let downloads =  Array.from(
            this.downloadManager.getDownloads(SOCKET_GROUP_NAME));

        return downloads.map( (task: DownloadTask): any => {
            return task.toJSON();
        });
    }

    /**
     * 
     * 
     * @protected
     * @param {IVideoFile} file 
     * @memberof DownloadController
     */
    protected downloadAction (file: IVideoFile) {
        const uri  = `https://www.youtube.com/watch?v=${file.video_id}`;
        const task = TaskFactory.createYoutubeTask(file.name, uri, DOWNLOAD_GROUP_NAME);
        this.downloadManager.registerDownload(task);
    }

    /**
     * 
     * 
     * @protected
     * @param {string} id 
     * @memberof DownloadController
     */
    protected cancelAction (id: string) {
        const task: DownloadTask = this.downloadManager.findTaskById(id);
        this.downloadManager.cancelDownload(task);
    }
}
