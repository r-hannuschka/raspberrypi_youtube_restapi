import { IChannel, ISocketController } from "../../../../libs/socket";
import { IObserver } from "../../../../libs/api";
import { DownloadManager, DownloadTask, TaskFactory, DOWNLOAD_STATE_END } from "../../../../libs/download"
import { DOWNLOAD_GROUP_NAME, IVideoFile, SOCKET_GROUP_NAME } from '../../api';

export class DownloadController implements IObserver<DownloadTask>, ISocketController {

    private socketChannel: IChannel;

    private downloadManager: DownloadManager;

    public constructor() {
        this.downloadManager = DownloadManager.getInstance();
        this.downloadManager.subscribe(this, SOCKET_GROUP_NAME);
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
     * Download Task has been updated
     *
     * @param {String} event
     * @param data
     */
    public update(task: DownloadTask) {

        // create new task and save image
        // and after you have done this 
        // save whole file information into the database
        // at this point it is usefull we have an observer on the task himself
        // if the download state for an image has been changed
        // create new download task and save all informations in DB after this is done
        if ( task.getState() === DOWNLOAD_STATE_END ) {
            // @todo implement
        }

        // @todo convert this task informations
        this.socketChannel.emit(`download_provider.download${task.getState()}`, task);
    }

    /**
     * new client has connected to our channel
     *
     * @returns IDownloads[]
     * @memberof DownloadProvider
     */
    public onConnected() {
        return Array.from(
            this.downloadManager.getDownloads(SOCKET_GROUP_NAME));
    }

    protected downloadAction (file: IVideoFile) {

        const uri  = `https://www.youtube.com/watch?v=${file.video_id}`;

        let fileName = `${file.name.replace(/\s/g, "_")}`;
        fileName = fileName.replace(/[^\w\d]/g, "");
        fileName = fileName + ".mp4";

        const task = TaskFactory.createYoutubeTask(fileName, uri, DOWNLOAD_GROUP_NAME);
        this.downloadManager.registerDownload(task);
    }

    protected cancelAction (id: string) {
        // get task id again ...
        // task by id finden
        this.downloadManager
            .cancelDownload(task);
    }
}
