import { 
    DownloadManager,
    DOWNLOAD_STATE_END,
    DOWNLOAD_GROUP_YOUTUBE,
    IDownloadTask,
    IDownload,
    IFileData,
    TaskFactory,
    IYoutubeFileData,
    IDownloadData,
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_ERROR
} from "rh-download"
import { ISubscription } from 'rh-utils';
import { IChannel, ISocketController } from "../../../../libs/socket";
import { SOCKET_GROUP_NAME } from '../../api';

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
    private registerSubscriptions() 
    {
        this.downloadManager.subscribe( (task: IDownloadTask) => {
            const download: IDownload = task.getDownload();

            if ( download.getState() === DOWNLOAD_STATE_END ) {
                this.finishVideoDownloadAction( download );
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

    /**
     * finish video download, download video image and persist all data
     * 
     * @protected
     * @param {IDownload} download 
     * @memberof DownloadController
     */
    protected finishVideoDownloadAction(download: IDownload) {

        const raw: IYoutubeFileData = download.getRaw() as IYoutubeFileData;
        const image: IFileData = { name: raw.name, type: 'image' };
        const task = TaskFactory.createImageTask(image, raw.imageUri, `image_download_${raw.video_id}`);

        const sub: ISubscription = task.subscribe( (data: IDownloadData) => {
            switch ( data.state ) {
                case DOWNLOAD_STATE_END:
                    console.log('save image now');
                case DOWNLOAD_STATE_CANCEL:
                case DOWNLOAD_STATE_ERROR:
                    sub.unsubscribe();
                    break;
            }
        });

        this.downloadManager.registerDownload(task);
    }
}
