import { AppConfig } from "../../AppConfig";
import { DOWNLOAD_TASK_YOUTUBE } from '../api';
import { DownloadTask, Download } from '../model';
import { Sanitize } from '../../Sanitize';

export abstract class TaskFactory {

    public static createYoutubeTask(name, uri, group = 'global'): DownloadTask {

        // create download file ...
        const download: Download = new Download();
        download.setName(name);
        download.setFileName(Sanitize.sanitizeFileName(name));
        download.setDestination(AppConfig.get('paths.media.video'));
        download.setUri(uri);

        // create task
        const task = new DownloadTask();
        task.setDownload( download )
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);

        return task;
    }
}