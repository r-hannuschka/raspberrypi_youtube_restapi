import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Observable } from "../api/Observable";
import { Observer } from "../api/Observer";
import { Logger } from "./Logger";

import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_INITIALIZED,
    DOWNLOAD_STATE_PROGRESS,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_UPDATE,
    IDownloadTask
} from "../api/Download";

interface IDownloadMessage {
    state: string,
    data?: {
        loaded: number,
        total: number
    },
    error?: string,
    processId: string
};

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
            state: DOWNLOAD_STATE_QUEUED,
            task,
        };

        this.downloadTasks.set(download.pid, download);

        this.logService.log(
            Logger.LOG_DEBUG,
            `initialize download: ${JSON.stringify(download)}`
        );

        this.send(DOWNLOAD_STATE_INITIALIZED, download);
        this.downloadQueue.push(download);
    }

    /**
     *
     *
     * @param {any} id
     * @memberof DownloadProvider
     */
    public cancelDownload(id) {
        const task: IDownloadTask = this.downloadTasks.get(id);
        if ( !task ) {
            return;
        }

        if ( task.state === DOWNLOAD_STATE_QUEUED ) {
            this.downloadQueue.remove( (download) => {
                if ( download.data.pid !== id ) {
                    return false;
                }
                return true;
            });
        };

        this.stopDownloadProcess(task);
        task.state = DOWNLOAD_STATE_CANCEL;
        this.send(DOWNLOAD_STATE_UPDATE, task);
    }

    /**
     *
     * @param {String} groupname
     */
    public getDownloads(groupName?: string): IDownloadTask[] {
        let currentTasks: IDownloadTask[] = Array.from(this.downloadTasks.values());
        if ( groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length ) {
            currentTasks = currentTasks.filter( (task: IDownloadTask) => {
                return task.group === groupName;
            });
        }
        return currentTasks;
    }

    /**
     *
     *
     * @private
     * @param {IDownloadMessage} data
     * @returns {boolean}
     * @memberof DownloadProvider
     */
    private handleDownloadResponse(response: IDownloadMessage) {

        const downloadTask: IDownloadTask = this.downloadTasks.get(response.processId);
        let debugMessage: string = "";

        // set current download state
        downloadTask.state = response.state || DOWNLOAD_STATE_ERROR;

        switch (response.state) {
            case DOWNLOAD_STATE_END:
                debugMessage = `finish download: ${JSON.stringify(downloadTask) }`
                break;

            case DOWNLOAD_STATE_PROGRESS:
                downloadTask.loaded = response.data.loaded;
                // debugMessage = `loaded: ${downloadTask.loaded}`;
                break;

            case DOWNLOAD_STATE_START:
                downloadTask.size = response.data.total;
                downloadTask.state = DOWNLOAD_STATE_START;
                debugMessage = `start download: ${JSON.stringify(response)}`;
                break;

            case DOWNLOAD_STATE_ERROR:
                downloadTask.error = response.error;
                debugMessage = `error download: ${JSON.stringify(downloadTask) }`;
                break;

            default:
                downloadTask.state = DOWNLOAD_STATE_ERROR;
                downloadTask.error = "something went terrible wrong !";
        }

        if ( debugMessage.length ) {
            this.logService.log(Logger.LOG_DEBUG, debugMessage);
        }

        /**
         * send update message
         */
        this.send(DOWNLOAD_STATE_UPDATE, downloadTask);
    }

    /**
     *
     * @param action
     * @param download
     */
    private send(action: string, download: IDownloadTask) {
        this.observers.forEach( (observer: Observer) => {
            observer.notify(action, Object.assign({}, download));
        });
    }

    private stopDownloadProcess( task: IDownloadTask ) {

        if (
            task.state === DOWNLOAD_STATE_START       ||
            task.state === DOWNLOAD_STATE_INITIALIZED ||
            task.state === DOWNLOAD_STATE_PROGRESS
        ) {
            this.processes.get(task.pid).kill("SIGINT");
        } else {
            this.removeDownload(task);
        }
    }

    private removeDownload(task: IDownloadTask) {

        if ( this.downloadTasks.has(task.pid) ) {
            this.downloadTasks.delete(task.pid);
        }

        if ( this.processes.has(task.pid) ) {
            this.processes.delete(task.pid);
        }
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

        childProcess.on("message", this.handleDownloadResponse.bind(this));

        childProcess.on("error", (message: IDownloadMessage) => {
            this.logService.log(
                Logger.LOG_DEBUG,
                `task error: ${message}`
            );
        });

        childProcess.on("exit", (...args) => {
            this.logService.log(
                Logger.LOG_DEBUG,
                `download exit: ${args}`
            );
            this.removeDownload(download);
            done();
        });

        if ( download.state === DOWNLOAD_STATE_QUEUED ) {
            this.logService.log(
                Logger.LOG_DEBUG,
                `download start: ${JSON.stringify(download)}`
            );

            download.state = DOWNLOAD_STATE_START;
            this.send(DOWNLOAD_STATE_UPDATE, download);
        }

        // send message to task
        childProcess.send(download.pid);
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
