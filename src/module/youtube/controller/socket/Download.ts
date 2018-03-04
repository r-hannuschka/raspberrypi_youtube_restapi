import { 
    DownloadManager,
    DOWNLOAD_GROUP_YOUTUBE,
    DOWNLOAD_STATE_END,
    IDownloadTask,
    IDownload,
    TaskFactory,
    IYoutubeFileData,
    IDownloadData
} from "rh-download"
import { FileManager, IFileData } from "@app-core/file";
import { IChannel, ISocketController } from "@app-libs/socket";
import { SOCKET_GROUP_NAME } from '../../api';

export class DownloadController implements ISocketController {

    private socketChannel: IChannel;

    private downloadManager: DownloadManager;

    private fileManager: FileManager;

    public constructor() {

        this.downloadManager = DownloadManager.getInstance();
        this.fileManager     = FileManager.getInstance();

        this.registerSubscriptions();
    }

    /**
     * 
     * @private
     * @memberof DownloadController
     */
    private registerSubscriptions() 
    {
        this.downloadManager.subscribe( (task: IDownloadTask) => {

            const download: IDownload = task.getDownload();
            const raw: IYoutubeFileData = download.getRaw() as IYoutubeFileData;
            if ( download.getState() === DOWNLOAD_STATE_END ) {

                const fileData: IFileData = {
                    name: download.getName(),
                    file : `${download.getDestination()}/${download.getFileName()}`,
                    description: raw.description,
                    type: raw.type,
                    image: raw.imageUri
                };

                this.fileManager.add(
                    this.fileManager.createFile(fileData));
            }
            this.socketChannel.emit(`download_provider.download${download.getState()}`, task.toJSON());
        }, DOWNLOAD_GROUP_YOUTUBE);
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

        return downloads.map( (task: IDownloadTask): IDownloadData => {
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
    protected downloadAction (file: IYoutubeFileData) {
        const task = TaskFactory.createYoutubeTask(file, DOWNLOAD_GROUP_YOUTUBE);
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
        const task: IDownloadTask = this.downloadManager.findTaskById(id);
        this.downloadManager.cancelDownload(task);
    }
}
