import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { IEndpoint } from "../../../api/EndpointInterface";
import { Channel } from "../../../model/socket/Channel";
import { SocketManager } from "../../../model/socket/SocketManager";
import { Logger } from "../../../provider/Logger";

import {
    ACTION_DOWNLOAD_CANCEL,
    ACTION_DOWNLOAD_END,
    ACTION_DOWNLOAD_INITIALIZED,
    ACTION_DOWNLOAD_PROGRESS,
    ACTION_DOWNLOAD_QUEUED,
    ACTION_DOWNLOAD_START,
    ACTION_DOWNLOAD_UPDATE,
    IDownload
} from "../api/Download";

interface IDownloadMessage {
    action: string,

    download: IDownload
}

export class DownloadProvider implements IEndpoint {

    private static instance: DownloadProvider = new DownloadProvider();

    private downloadQueue: any;

    private downloadTasks: Map<string, IDownload>;

    private processes: Map<string, ChildProcess>

    private socketChannel: Channel;

    private socketManager: SocketManager;

    private logService: Logger;

    public static readonly YOUTUBE_URL_TEMPLATE = "www.youtube.com/watch?v=";

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

        this.socketManager = SocketManager.getInstance();

        this.processes = new Map();
        this.downloadTasks = new Map();

        DownloadProvider.instance = this;
    }

    public bootstrap(config) {
        this.socketChannel = this.socketManager.createChannel(config.channel);
        this.socketChannel.setEndpoint( this );
    }

    /**
     *
     * @static
     * @returns
     * @memberof DownloadProvider
     */
    public static getInstance() {
        return DownloadProvider.instance;
    }

    public downloadVideo(data) {

        const uri  = `${DownloadProvider.YOUTUBE_URL_TEMPLATE}${data.id}`;
        const path = "/media/youtube_videos";
        const name = `${data.name.replace(/\s/g, "_")}.mp4`;

        const download: IDownload = {
            loaded: 0,
            name,
            path,
            pid: Math.random().toString(32).substr(2),
            size: 0,
            state: ACTION_DOWNLOAD_QUEUED,
            uri
        };

        if ( this.downloadQueue.running() < this.downloadQueue.concurrency ) {
            download.state = ACTION_DOWNLOAD_START;
        }

        this.downloadTasks.set(download.pid, download);

        this.logService.log(
            Logger.LOG_DEBUG,
            `initialize download: ${JSON.stringify(download)}`
        );

        this.send(ACTION_DOWNLOAD_INITIALIZED, download);
        this.downloadQueue.push(download);
    }

    public cancelDownload(id) {
        const downloadTask: IDownload = this.downloadTasks.get(id);

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
     * execute task
     *
     * @param task
     */
    public execute(task) {

        switch (task.action) {
            case "download":
                this.downloadVideo(task.data)
                break;
            case "cancel":
                this.cancelDownload(task.data);
                break;
            default:
        }
    }

    /**
     * new client has connected
     *
     * @returns IDownloads[]
     * @memberof DownloadProvider
     */
    public onConnected() {
        return Array.from(
            this.downloadTasks.values());
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

        const downloadTask: IDownload = this.downloadTasks.get(data.download.pid);

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

    private send(action: string, download: IDownload) {
        this.socketChannel.emit(action, download);
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

        const childProcess: ChildProcess = fork(
            `../tasks/download.task`,
            [
                "--dir", download.path,
                "--name", download.name,
                "--uri", download.uri
            ], // arguments
            {
                cwd: __dirname,
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
}
