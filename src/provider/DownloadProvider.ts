import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Observable } from "../api/Observable";
import { Observer } from "../api/Observer";
import { Logger } from "./Logger";

import {
    ACTION_DOWNLOAD_CANCEL,
    ACTION_DOWNLOAD_END,
    ACTION_DOWNLOAD_INITIALIZED,
    ACTION_DOWNLOAD_PROGRESS,
    ACTION_DOWNLOAD_QUEUED,
    ACTION_DOWNLOAD_START,
    ACTION_DOWNLOAD_UPDATE,
    IDownloadTask
} from "../api/Download";

interface IDownloadMessage {
    action: string,

    download: IDownloadTask
}

export class DownloadProvider implements Observable {

    private downloadQueue: any;

    private downloadTasks: Map<string, IDownloadTask>;

    private processes: Map<string, ChildProcess>

    private logService: Logger;

    private observers: Observer[] = [];

    private static readonly instance: DownloadProvider = new DownloadProvider();

    public constructor() {

        if (DownloadProvider.instance) {
            throw new Error("use DownloadProvider::getInstance()");
        }

        this.logService = Logger.getInstance();

        this.downloadQueue = async.queue(
            (data, done) => {
                this.runTask(data, done);
            },
            1 // max downloads at once
        );

        this.processes = new Map();
        this.downloadTasks = new Map();
    }

    public static getInstance(): DownloadProvider {
        return DownloadProvider.instance;
    }

    /**
     *
     * @param {Observer} observer
     */
    public subscribe(observer: Observer) {
        if ( this.observers.indexOf(observer) === -1 ) {
            this.observers.push(observer);
        }
    }

    /**
     *
     * @param {Observer} observer
     */
    public unsubscribe(observer: Observer) {
        const index = this.observers.indexOf(observer)
        if ( index !== -1 ) {
            this.observers.splice(index, 1);
        }
    }

    /**
     *
     *
     * @param {any} data
     * @param {string} task
     * @memberof DownloadProvider
     */
    public initDownload(task: string, param: {[key: string]: any} = {}, group?: string) {

        const download: IDownloadTask = {
            group,
            loaded: 0,
            param,
            pid: Math.random().toString(32).substr(2),
            size: 0,
            state: ACTION_DOWNLOAD_QUEUED,
            task,
        };

        /*
        if ( this.downloadQueue.running() < this.downloadQueue.concurrency ) {
            download.state = ACTION_DOWNLOAD_START;
        }
        */

        this.downloadTasks.set(download.pid, download);

        this.logService.log(
            Logger.LOG_DEBUG,
            `initialize download: ${JSON.stringify(download)}`
        );

        this.send(ACTION_DOWNLOAD_INITIALIZED, download);
        this.downloadQueue.push(download);
    }

    /**
     *
     *
     * @param {any} id
     * @memberof DownloadProvider
     */
    public cancelDownload(id) {
        const downloadTask: IDownloadTask = this.downloadTasks.get(id);
        if ( downloadTask ) {
            this.downloadQueue.remove( (download) => {
                if ( download.data.pid !== id ) {
                    return false;
                }
                // download is not queued anymore
                if (downloadTask.state !== ACTION_DOWNLOAD_QUEUED) {
                    return false;
                }
                return true;
            });

            downloadTask.state = ACTION_DOWNLOAD_CANCEL;
            this.send(ACTION_DOWNLOAD_UPDATE, downloadTask);

            if ( this.processes.has(id) ) {
                this.processes.get(id).kill("SIGINT");
            }
        }
    }

    /**
     *
     * @param {String} groupname
     */
    public getDownloads(groupName?: string): IDownloadTask[] {
        let currentTasks: IDownloadTask[] = Array.from(this.downloadTasks);
        if ( groupName && groupName.replace(/^\s*(.*?)\s*$/, "").length ) {
            currentTasks = currentTasks.filter( (task: IDownloadTask) => {
                return task.group === groupName;
            });
        }
        return currentTasks
    }

    /**
     *
     *
     * @private
     * @param {IDownloadMessage} data
     * @returns {boolean}
     * @memberof DownloadProvider
     */
    private handleMessage(data: IDownloadMessage): boolean {
        let isFinish = false;

        const downloadTask: IDownloadTask = this.downloadTasks.get(data.download.pid);

        switch (data.action) {
            case ACTION_DOWNLOAD_START:
                downloadTask.state = ACTION_DOWNLOAD_START;
                downloadTask.size  = data.download.size;

                this.logService.log(
                    Logger.LOG_DEBUG,
                    `start download: ${JSON.stringify(data.download)}`
                );
                break;
            case ACTION_DOWNLOAD_END:
                downloadTask.state = ACTION_DOWNLOAD_END;
                this.downloadTasks.delete(data.download.pid);
                isFinish = true;

                this.logService.log(
                    Logger.LOG_DEBUG,
                    `finish download: ${JSON.stringify(data.download) }`
                );
                break;
            case ACTION_DOWNLOAD_PROGRESS:
                downloadTask.loaded = data.download.loaded;
                downloadTask.state = ACTION_DOWNLOAD_PROGRESS
                break;
            default:
                downloadTask.size  = data.download.size;
                downloadTask.state = ACTION_DOWNLOAD_START;
        }

        this.send(ACTION_DOWNLOAD_UPDATE, downloadTask);
        return isFinish;
    }

    /**
     *
     * @param action
     * @param download
     */
    private send(action: string, download: IDownloadTask) {
        // notify Observers
        this.observers.forEach( (observer: Observer) => {
            observer.notify(action, Object.assign({}, download));
        });
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof DownloadProvider
     */
    private runTask(download: IDownloadTask, done) {

        const taskParameter = this.createTaskParameters(download.param);
        const childProcess: ChildProcess = fork(
            download.task,
            taskParameter,
            {
                stdio: [
                    "pipe",
                    "pipe",
                    "pipe",
                    "ipc"
                ]
            }
        );

        this.processes.set(download.pid, childProcess);

        childProcess.stdout.on("data", (message) => {
            this.logService.log(
                Logger.LOG_DEBUG,
                `task message: ${message}`
            );
        });

        childProcess.on("message", (message: IDownloadMessage) => {
            if (this.handleMessage(message)) {
                childProcess.kill("SIGINT");
            }
        });

        childProcess.on("error", (message: IDownloadMessage) => {
            this.logService.log(
                Logger.LOG_DEBUG,
                `task message: ${message}`
            );
            childProcess.kill("SIGINT");
        });

        childProcess.on("exit", () => {
            this.downloadTasks.delete(download.pid);
            this.processes.delete(download.pid);
            done();
        });

        if ( download.state === ACTION_DOWNLOAD_QUEUED ) {

            this.logService.log(
                Logger.LOG_DEBUG,
                `download start: ${JSON.stringify(download)}`
            );

            download.state = ACTION_DOWNLOAD_START;
            this.send(ACTION_DOWNLOAD_UPDATE, download);
        }

        // send message to task
        childProcess.send(download);
    }

    /**
     * convert params from object to array
     *
     * @param params
     */
    private createTaskParameters(params: {[key: string]: any}): any[] {
        let flattenParams = [];
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                flattenParams = flattenParams.concat([
                    `--${key}`,
                    params[key]
                ]);
            }
        }
        return flattenParams;
    }
}
