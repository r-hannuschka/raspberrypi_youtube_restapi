import { AppConfig } from "../../AppConfig";
import { DOWNLOAD_TASK_YOUTUBE } from '../api';
import { DownloadTask, Download } from '../model';

export abstract class TaskFactory {

    public static createYoutubeTask(filename, uri, group = 'global'): DownloadTask {

        // create download file ...
        const download: Download = new Download();
        download.setName(filename);
        download.setDestination(AppConfig.get('paths.media.video'));
        download.setUri(uri);

        // create task
        const task = new DownloadTask();
        task.setTaskFile( DOWNLOAD_TASK_YOUTUBE );
        task.setDownload( download )
        task.setGroupName(group);

        return task;
    }
}