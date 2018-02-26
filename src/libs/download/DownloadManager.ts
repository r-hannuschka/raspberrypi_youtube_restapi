import * as async from "async";

import { ChildProcess, fork } from "child_process";
import { Logger } from "../Log";
import { Sanitize } from "../Sanitize";
import { Download, DownloadTask } from "./model";
import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_PROGRESS,
    IDownload,
    IMessage,
} from "./api";

export class DownloadManager {

    private taskQueue: any;

    // alle downloads egal ob laufend oder nicht
    private downloadTasks: Set<DownloadTask>;

    // laufende Prozesse Task verbunden mit Process
    private processes: WeakMap<DownloadTask, ChildProcess>

    private logService: Logger;

    private static readonly instance: DownloadManager = new DownloadManager();

    public constructor() {

        if (DownloadManager.instance) {
            throw new Error("use DownloadManager::getInstance()");
        }

        this.logService = Logger.getInstance();

        this.taskQueue = async.queue(
            (data, done) => {
                this.runTask(data, done);
            },
            2 // max downloads at once
        );

        this.downloadTasks = new Set();
        this.processes     = new WeakMap();
    }

    public static getInstance(): DownloadManager {
        return DownloadManager.instance;
    }

    /**
     * 
     * 
     * @param {DownloadTask} task 
     * @param {boolean} [autostart=true] 
     * @memberof DownloadManager
     */
    public registerDownload(task: DownloadTask, autostart = true)  {

        task.setTaskId(Math.random().toString(32).substr(2));
        this.downloadTasks.add(task);

        this.logService.log(
            Logger.LOG_DEBUG,
            `initialize download: ${task.getDownload().getName()}`
        );

        if ( autostart ) {
            this.startDownload(task);
        }
    }

    /**
     * 
     * 
     * @param {DownloadTask} task 
     * @memberof DownloadManager
     */
    public startDownload(task: DownloadTask) {

        this.logService.log(
            Logger.LOG_DEBUG,
            `add download to queue: ${task.getDownload().getName()}`
        );

        this.updateTask(task, DOWNLOAD_STATE_QUEUED);
        this.taskQueue.push(task);
    }

    /**
     *
     *
     * @param {any} id
     * @memberof Download
     */
    public cancelDownload(_task) {

        const task: DownloadTask = this.downloadTasks[_task];
        const download: Download = task.getDownload() as Download;

        if (!task) {
            return;
        }

        if (download.getState() === DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item: any) => {
                if (item !== task) {
                    return false;
                }
                return true;
            });
        };

        this.updateTask(task, DOWNLOAD_STATE_CANCEL);
    }

    /**
     * find task by id
     * 
     * @param id 
     */
    public findTaskById(id: string): DownloadTask | null {
        let task: DownloadTask | null = null;
        this.downloadTasks.forEach( (t: DownloadTask) => {
            if ( t.getTaskId() === id ) {
                task = t;
            }
        });
        return task;
    }

    /**
     *
     * @param {String} groupname
     */
    public getDownloads(groupName?: string): DownloadTask[] {

        let currentTasks = Array.from(this.downloadTasks.values());

        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task: DownloadTask) => {
                return task.getGroupName() === groupName;
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
    private updateTask(task: DownloadTask, state: string, data = null): void {

        if (state === DOWNLOAD_STATE_CANCEL ||
            state === DOWNLOAD_STATE_ERROR ||
            state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }

        data = data || { loaded: 0, size: 0, error: '' };

        const download: Download = task.getDownload() as Download;
        download.setState(state);
        download.setLoaded(data.loaded);
        download.setSize(data.size);
        download.setError(data.error);

        task.update();
    }

    /**
     * remove download
     * 
     * @private
     * @param {any} task 
     * @memberof DownloadManager
     */
    private removeDownload(task) {

        if (this.downloadTasks.has(task)) {
            this.downloadTasks.delete(task);
        }
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof Download
     */
    private runTask(task: DownloadTask, done) {

        const download: IDownload = task.getDownload();

        const name = Sanitize.sanitizeFileName(
            download.getName());

        const params = [
            "--dir" , download.getDestination(),
            "--name", name,
            "--uri" , download.getUri()
        ];

        const childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);

        childProcess.on("message",  (response: IMessage) => {
            this.onDownloadTaskMessage(response, task);
        });

        childProcess.once("exit", () => {
            childProcess.removeAllListeners();
            done();
        });

        // send message to child process
        childProcess.send("start");

        this.updateTask(task, DOWNLOAD_STATE_START );
    }

    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    private onDownloadTaskMessage(response: IMessage, task: DownloadTask) {

        const state = response.state || DOWNLOAD_STATE_ERROR;
        const data = {
            error : response.error,
            loaded: response.data.loaded || 0,
            size  : response.data.total  || 0
        };

        if ( response.state !== DOWNLOAD_STATE_PROGRESS ) {
            this.logService.log(Logger.LOG_DEBUG, JSON.stringify(response) );
        }

        this.updateTask(task, state, data);
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
                ],
            }
        );
        return childProcess;
    }
}
