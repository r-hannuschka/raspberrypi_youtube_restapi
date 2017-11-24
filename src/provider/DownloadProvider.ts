import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Observer } from "../api/Observer";
import { Logger } from "./Logger";

import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    IDownload,
    IDownloadObservable,
    IDownloadObserver,
} from "../api/download";

import { IFile } from "../api/FileInterface";

interface IDownloadMessage {
    state: string,
    data?: {
        loaded: number,
        total: number
    },
    error?: string,
    processId: string
};

export class DownloadProvider implements IDownloadObservable {

    private downloadQueue: any;

    private downloadTasks: Map<string, IDownload>;

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
     * @param {IDownloadObserver} observer
     */
    public subscribe(observer: IDownloadObserver) {
        if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
        }
    }

    /**
     *
     * @param {IDownloadObserver} observer
     */
    public unsubscribe(observer: IDownloadObserver) {
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
    public initDownload(task: string, uri: string, raw: IFile, group?: string) {

        const download: IDownload = {
            group,
            loaded: 0,
            pid: Math.random().toString(32).substr(2),
            raw,
            size: 0,
            state: DOWNLOAD_STATE_QUEUED,
            task,
            uri
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
        const task: IDownload = this.downloadTasks.get(id);
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
    public getDownloads(groupName?: string): IDownload[] {
        let currentTasks: IDownload[] = Array.from(this.downloadTasks.values());
        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task: IDownload) => {
                return task.group === groupName;
            });
        }
        return currentTasks;
    }

    /**
     *
     * @param action
     * @param download
     */
    public notify(download: IDownload) {
        this.observers.forEach((observer: IDownloadObserver) => {
            observer.update(Object.assign({}, download));
        });
    }

    /**
     *
     *
     * @private
     * @param {IDownloadMessage} data
     * @memberof DownloadProvider
     */
    private updateDownload(task: IDownload): void {

        if (task.state === DOWNLOAD_STATE_CANCEL ||
            task.state === DOWNLOAD_STATE_ERROR ||
            task.state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task.pid)) {
                this.processes.get(task.pid).kill("SIGINT");
            }

            this.removeDownload(task.pid);
        }

        this.notify(task);
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
    private runTask(download: IDownload, done) {

        const params = [
            "--dir" , download.raw.path,
            "--name", download.raw.name,
            "--uri" , download.uri
        ];
        const childProcess = this.createChildProcess(download.task, params);

        this.processes.set(download.pid, childProcess);

        download.state = DOWNLOAD_STATE_START;

        childProcess.on("message", (response: IDownloadMessage) => {

            const task: IDownload = this.downloadTasks.get(response.processId);
            task.state = response.state || DOWNLOAD_STATE_ERROR;

            if (response.state !== DOWNLOAD_STATE_ERROR) {
                task.loaded = response.data.loaded || 0;
                task.size = response.data.total || 0;
            }

            task.error = response.error;
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
}
