import * as async from "async";

import { ChildProcess, fork } from "child_process";
import { Logger } from "../Log";
import { IObserver, IObservable } from "../api";
import { Download, DownloadTask } from "./model";
import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    IMessage
} from "./api";

// import { IFile } from "../api/FileInterface";

export class DownloadManager implements IObservable<DownloadTask> {

    private taskQueue: any;

    // alle downloads egal ob laufend oder nicht
    private downloadTasks: Set<DownloadTask>;

    // laufende Prozesse Task verbunden mit Process
    private processes: WeakMap<DownloadTask, ChildProcess>

    private logService: Logger;

    private observers: Map<string, IObserver<DownloadTask>[]>;

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
        this.observers     = new Map();
        this.processes     = new WeakMap();
    }

    public static getInstance(): DownloadManager {
        return DownloadManager.instance;
    }

    /**
     *
     * @param {IObserver} observer
     */
    public subscribe(observer: IObserver<DownloadTask>, group = "global") {

        if (this.observers.has(group)) {
            this.observers.get(group).push(observer);
        } else {
            this.observers.set(group, [observer]);
        }
    }

    /**
     *
     * @param {IObserver} observer
     */
    public unsubscribe(observer: IObserver<DownloadTask>, group = "global") {

        if ( this.observers.has(group) ) {
            const observers = this.observers.get(group);
            const index     = observers.indexOf(observer);

            observers.splice(index, 1);

            if ( ! observers.length ) {
                this.observers.delete(group);
            }
        }
    }

    /**
     * 
     * 
     * @param {DownloadTask} task 
     * @param {boolean} [autostart=true] 
     * @memberof DownloadManager
     */
    public registerDownload(task: DownloadTask, autostart = true)  {

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
     * starts a download and loads them into a queue
     *
     * @param {IDownload} download
     * @memberof Download
     */
    public startDownload(task: DownloadTask) {

        this.logService.log(
            Logger.LOG_DEBUG,
            `start download: ${task.getDownload().getName()}`
        );

        task.setState(DOWNLOAD_STATE_QUEUED);
        this.updateTask(task);
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

        if (!task) {
            return;
        }

        if (task.getState() === DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item: any) => {
                if (item !== task) {
                    return false;
                }
                return true;
            });
        };

        task.setState( DOWNLOAD_STATE_CANCEL );
        this.updateTask(task);
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
     * @param action
     * @param download
     */
    public notify(task: DownloadTask) {

        let observers = this.observers.get("global") || [];
        observers = observers.concat(
            this.observers.get(task.getGroupName()) || []);

        observers.forEach((observer: IObserver<DownloadTask>) => {
            observer.update(task);
        });
    }

    /**
     *
     *
     * @private
     * @param {IDownloadMessage} data
     * @memberof DownloadProvider
     */
    private updateTask(task: DownloadTask): void {

        const state = task.getState();

        if (state === DOWNLOAD_STATE_CANCEL ||
            state === DOWNLOAD_STATE_ERROR ||
            state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }
        this.notify(task);
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

        const params = [
            "--dir" , task.getDownload().getDestination(),
            "--name", task.getDownload().getName(),
            "--uri" , task.getDownload().getUri()
        ];

        const childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);

        task.setState(DOWNLOAD_STATE_START);

        childProcess.on("message",  (response: IMessage) => {
            this.onDownloadTaskMessage(response, task);
        });

        childProcess.stderr.on('data', (err) => {
            console.log ( err.toString() );
        });

        childProcess.once("exit", () => {
            childProcess.removeAllListeners();
            done();
        });

        // send message to child process
        childProcess.send("start");

        this.updateTask(task);
    }

    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    private onDownloadTaskMessage(response: IMessage, task: DownloadTask) {

        task.setState( response.state || DOWNLOAD_STATE_ERROR );

        const download: Download = task.getDownload() as Download;

        if (response.state !== DOWNLOAD_STATE_ERROR) {
            download.setLoaded(response.data.loaded || 0)
            download.setSize(response.data.total || 0);
        }

        download.setError(response.error);
        this.updateTask(task);
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
