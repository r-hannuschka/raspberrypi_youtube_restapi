import { IDownloadData, IDownloadTask, DownloadManager, IYoutubeFileData, IFileData, TaskFactory, DOWNLOAD_STATE_END, DOWNLOAD_STATE_CANCEL, DOWNLOAD_STATE_ERROR} from 'rh-download';
import { ISubscription } from 'rh-utils';

export function saveVideoAction(data: IYoutubeFileData, path: string, id: string) {

    // persistieren 
    // dann bild laden 
    // wenn bild da 
    // update

    const image: IFileData    = { name: data.name, type: 'image' };
    const task: IDownloadTask = TaskFactory.createImageTask(image, data.imageUri, id);
    const sub: ISubscription  = task.subscribe( (data: IDownloadData) => {
        switch ( data.state ) {
            case DOWNLOAD_STATE_END:
                // update video data
            case DOWNLOAD_STATE_CANCEL:
            case DOWNLOAD_STATE_ERROR:
                sub.unsubscribe();
                break;
        }
    });

    const downloadManager = DownloadManager.getInstance();
    downloadManager.registerDownload(task);
}