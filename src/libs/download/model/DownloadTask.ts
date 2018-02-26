import { Observable } from "../../observer/Observable";
import { IDownload, IDownloadData } from "../api";
import { Download } from "./Download";

export class DownloadTask extends Observable<IDownloadData>
{
    private download: Download;

    private taskFile: string;

    private groupName: string;

    private taskId: string;

    public getDownload(): IDownload {
        return this.download;
    }

    public getGroupName(): string {
        return this.groupName;
    }

    public getTaskId(): string {
        return this.taskId;
    }

    /**
     * 
     * 
     * @private
     * @param {string} taskFile 
     * @memberof DownloadTask
     */
    public getTaskFile() {
        return this.taskFile;
    }

    /**
     * 
     * 
     * @param {Download} download 
     * @memberof DownloadTask
     */
    public setDownload(download: Download) {
        this.download = download
    }

    /**
     * 
     * 
     * @param {string} name 
     * @memberof DownloadTask
     */
    public setGroupName(name: string) {
        this.groupName = name;
    }

    public setTaskId(id: string) {
        this.taskId = id;
    }

    /**
     * 
     * 
     * @private
     * @param {string} taskFile 
     * @memberof DownloadTask
     */
    public setTaskFile(taskFile: string) {
        this.taskFile = taskFile;
    }

    /**
     * 
     * 
     * @memberof DownloadTask
     */
    public update() {
        this.publish( this.toJSON() );
    }

    public toJSON(): IDownloadData {
        const download: IDownload = this.getDownload();
        return {
            error : download.getError(),
            group : this.getGroupName(),
            state : download.getState(),
            loaded: download.getLoaded(),
            name  : download.getName(),
            id    : this.getTaskId(),
            size  : download.getSize()
        };
    }
}
