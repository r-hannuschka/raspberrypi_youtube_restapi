import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { IEndpoint } from "../../../api/EndpointInterface";
import { Channel } from "../../../model/socket/Channel";
import { SocketManager } from "../../../model/socket/SocketManager";
import {
    ACTION_DOWNLOAD_END,
    ACTION_DOWNLOAD_PROGRESS,
    ACTION_DOWNLOAD_QUEUED,
    ACTION_DOWNLOAD_START,
    IDownload
} from "../api/Download";

interface IDownloadMessage {
    action: string,

    download: IDownload
}

export class DownloadProvider implements IEndpoint {

    private static instance: DownloadProvider = new DownloadProvider();

    private downloadQueue: any;

    private tasks: Map<string, IDownload>;

    private socketChannel: Channel;

    private socketManager: SocketManager;

    public constructor() {

        if (DownloadProvider.instance) {
            throw new Error("use DownloadProvider::getInstance()");
        }

        this.downloadQueue = async.queue(
            (data, done) => {
                this.runTask(data, done);
            },
            2
        );

        this.socketManager = SocketManager.getInstance();
        this.tasks = new Map();

        DownloadProvider.instance = this;
    }

    public bootstrap(config) {
        this.socketChannel = this.socketManager.createChannel(config.channel);
        this.socketChannel.setEndpoint( this );
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof DownloadProvider
     */
    public static getInstance() {
        return DownloadProvider.instance;
    }

    public downloadVideo(data) {
        const download: IDownload = {
            loaded: 0,
            name: data.name || null,
            path: data.path,
            pid: Math.random().toString(32).substr(2),
            size: 0,
            state: ACTION_DOWNLOAD_QUEUED,
            uri: data.uri
        };

        this.tasks.set(download.pid, download);
        this.send(ACTION_DOWNLOAD_QUEUED, download);
        this.downloadQueue.push(download);

        return {
            download,
            socket: {
                channelID: this.socketChannel.getId()
            }
        };
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
            this.tasks.values());
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

        const downloadTask: IDownload = this.tasks.get(data.download.pid);

        switch (data.action) {
            case ACTION_DOWNLOAD_END:
                downloadTask.state = ACTION_DOWNLOAD_END;
                this.tasks.delete(data.download.pid);
                isFinish = true;
                break;
            case ACTION_DOWNLOAD_PROGRESS:
                downloadTask.loaded = data.download.loaded;
                downloadTask.state = ACTION_DOWNLOAD_PROGRESS
                break;
            default:
                downloadTask.size  = data.download.size;
                downloadTask.state = ACTION_DOWNLOAD_START;
        }

        this.send(data.action, downloadTask);
        return isFinish;
    }

    private send(action: string, download: IDownload) {
        this.socketChannel.emit(ACTION_DOWNLOAD_START, download);
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof DownloadProvider
     */
    private runTask(data: IDownload, done) {

        const childProcess: ChildProcess = fork(
            `../tasks/download.task`,
            [
                "--name", data.name,
                "--uri", data.uri
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

        childProcess.stdout.on("data", (message) => {
            // @todo write debug log
            // tslint:disable-next-line:no-console
            console.log(message.toString());
        });

        childProcess.stderr.on("data", (error) => {
            // @todo write error to log
            console.error(error.toString());
            childProcess.kill();
            done();
        });

        childProcess.on("message", (message: IDownloadMessage) => {
            if (this.handleMessage(message)) {
                childProcess.kill();
                done();
            }
        });

        childProcess.send(data);
    }
}
