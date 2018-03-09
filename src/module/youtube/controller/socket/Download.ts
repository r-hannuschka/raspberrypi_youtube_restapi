import { IChannel, ISocketController } from "@app-libs/socket";
import {
    DOWNLOAD_GROUP_YOUTUBE,
    DOWNLOAD_STATE_END,
    DownloadManager,
    ITask,
    ITaskData,
    IYoutubeData,
    IYoutubeFile,
    TaskFactory,
    YoutubeTaskFactory
} from "rh-download"
import { saveYoutubeVideo } from "../../actions/save-youtube-video";
import { SOCKET_GROUP_NAME } from "../../api";

export class DownloadController implements ISocketController {

    private socketChannel: IChannel;

    private downloadManager: DownloadManager;

    public constructor() {
        this.downloadManager = DownloadManager.getInstance();
        this.registerSubscriptions();
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

        const downloads = Array.from(
            this.downloadManager.getTasks(SOCKET_GROUP_NAME));

        return downloads.map((task: ITask): ITaskData => {
            return task.raw();
        });
    }

    /**
     *
     *
     * @protected
     * @param {IVideoFile} file
     * @memberof DownloadController
     */
    protected downloadAction(data: IYoutubeData) {
        const factory: YoutubeTaskFactory = TaskFactory.getYoutubeTaskFactory();
        const task: ITask = factory.createTask(data, DOWNLOAD_GROUP_YOUTUBE);

        this.downloadManager.registerDownload(task);
    }

    /**
     *
     *
     * @protected
     * @param {string} id
     * @memberof DownloadController
     */
    protected cancelAction(id: string) {
        const task: ITask = this.downloadManager.findTaskById(id);
        this.downloadManager.cancelDownload(task);
    }

    /**
     *
     * @private
     * @memberof DownloadController
     */
    private registerSubscriptions() {
        this.downloadManager.subscribe(
            async (task: ITask) => {

                const file: IYoutubeFile = task.getFile() as IYoutubeFile;

                if (task.getState() === DOWNLOAD_STATE_END) {
                    saveYoutubeVideo(file);
                }

                this.socketChannel
                    .emit(`download_provider.download${task.getState()}`, file.raw());

            },
            DOWNLOAD_GROUP_YOUTUBE
        );
    }
}
