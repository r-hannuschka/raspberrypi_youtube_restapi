import { IObserver, IObservable } from "../../observable";
import { IDownload } from "../api";
import { Download } from "./Download";

export class DownloadTask implements IObservable<IDownload>
{
    private download: Download;

    private observers: Set<IObserver<IDownload>> = new Set();

    private taskFile: string;

    private state: string;
    
    private groupName: string;

    private taskId: string;

    public getDownload(): IDownload {
        return this.download;
    }

    public getGroupName(): string {
        return this.groupName;
    }

    public getState(): string {
        return this.state;
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

    /**
     * 
     * @param state 
     */
    public setState(state: string) {
        this.state = state;
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
    public updateDownload(state, data: IDownload) {
    }

    /**
     * 
     * @param observer 
     */
    public subscribe(observer: IObserver<IDownload>) {

        if ( ! this.observers.has(observer) ) {
            this.observers.add(observer);
        }
    }

    /**
     * 
     * @param observer 
     */
    public unsubscribe(observer: IObserver<IDownload>) {

        if ( ! this.observers.has(observer) ) {
            this.observers.delete(observer);
        }
    }

    /**
     * 
     * @param data 
     */
    public notify() {

        this.observers.forEach( (observer: IObserver<IDownload>) => {
            observer.update(this.download);
        });
    }
}
