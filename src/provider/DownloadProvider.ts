import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Observable } from "../api/Observable";
import { Observer } from "../api/Observer";
import { Logger } from "./Logger";

import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
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
            2 // max downloads at once
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
        if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
        }
    }

    /**
     *
     * @param {Observer} observer
     */
    public unsubscribe(observer: Observer) {
        const index = this.observers.indexOf(observer)
        if (index !== -1) {
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
    public initDownload(task: string, param: { [key: string]: any } = {}, group?: string) {

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

        download.state = DOWNLOAD_STATE_QUEUED;
        this.updateDownload(download);

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
        if (!task) {
            return;
        }

        if (task.state === DOWNLOAD_STATE_QUEUED) {
            this.downloadQueue.remove((download) => {
                if (download.data.pid !== id) {
                    return false;
                }
                return true;
            });
        };

        task.state = DOWNLOAD_STATE_CANCEL;
        this.updateDownload(task);
    }

    /**
     *
     * @param {String} groupname
     */
    public getDownloads(groupName?: string): IDownloadTask[] {
        let currentTasks: IDownloadTask[] = Array.from(this.downloadTasks.values());
        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task: IDownloadTask) => {
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
     * @memberof DownloadProvider
     */
     private updateDownload(task: IDownloadTask): void {

        if (task.state === DOWNLOAD_STATE_CANCEL ||
            task.state === DOWNLOAD_STATE_ERROR ||
            task.state === DOWNLOAD_STATE_END) {

            if ( this.processes.has(task.pid) ) {
                this.processes.get(task.pid).kill("SIGINT");
            }

            this.removeDownload(task.pid);
        }

        this.send(DOWNLOAD_STATE_UPDATE, task);
    }

    /**
     *
     * @param action
     * @param download
     */
    private send(action: string, download: IDownloadTask) {
        this.observers.forEach((observer: Observer) => {
            observer.notify(action, Object.assign({}, download));
        });
    }

    private removeDownload(id) {

        if (this.downloadTasks.has(id)) {
            this.downloadTasks.delete(id);
        }

        if (this.processes.has(id)) {
            this.processes.delete(id);
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

        const taskParams = this.createTaskParameters(download.param);
        const childProcess = this.createChildProcess(download.task, taskParams);

        this.processes.set(download.pid, childProcess);

        download.state = DOWNLOAD_STATE_START;

        childProcess.on("message", (response: IDownloadMessage) => {

            const task: IDownloadTask = this.downloadTasks.get(response.processId);
            task.state  = response.state || DOWNLOAD_STATE_ERROR;
            task.loaded = response.data.loaded || 0;
            task.size   = response.data.total || 0;
            task.error  = response.error;

            this.updateDownload(task);
        });

        childProcess.on("exit", (...args) => {
            done();
        });

        // start download
        childProcess.send(download.pid);
        this.updateDownload(download);
    }

    private createChildProcess(task, param): ChildProcess {
        const childProcess: ChildProcess = fork(
            task,
            param,
            {
                stdio: [
                    "pipe",
                    "pipe",
                    "pipe",
                    "ipc"
                ]
            }
        );
        return childProcess;
    }

    /**
     * convert params from object to array
     *
     * @param params
     */
    private createTaskParameters(params: { [key: string]: any }): any[] {
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
