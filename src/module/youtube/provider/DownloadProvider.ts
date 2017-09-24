import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { IExcecuteAble } from "../../../api/ExecuteAbleInterface";
import { Channel } from "../../../model/socket/Channel";
import { SocketManager } from "../../../model/socket/SocketManager";
import {
    ACTION_DOWNLOAD_END,
    ACTION_DOWNLOAD_PROGRESS,
    ACTION_DOWNLOAD_START,
    IDownload
} from "../api/Download";

interface IDownloadMessage {
    action: string,

    download: IDownload
}

export class DownloadProvider implements IExcecuteAble {

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

        this.tasks = new Map();

        this.socketManager = SocketManager.getInstance();
        this.socketChannel = this.socketManager.createChannel();
        this.socketChannel.setEndpoint( this );

        DownloadProvider.instance = this;
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
            isPending: true,
            isRunning: false,
            loaded: 0,
            name: data.name || null,
            path: data.path,
            pid: Math.random().toString(32).substr(2),
            size: 0,
            uri: data.uri
        };

        this.tasks.set(download.pid, download);
        this.downloadQueue.push(download);

        return {
            download,
            socket: {
                channelID: this.socketChannel.getId()
            }
        };
    }

    public execute(data): Promise<any> {

        return new Promise( (resolve, reject) => {
            resolve("worked");
        });
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

        // tslint:disable-next-line:switch-default
        switch (data.action) {
            case ACTION_DOWNLOAD_END:
                this.tasks.delete(data.download.pid);
                isFinish = true;
                break;
            case ACTION_DOWNLOAD_PROGRESS:
            case ACTION_DOWNLOAD_START:
                this.socketChannel.emit(ACTION_DOWNLOAD_START, data.download);
                this.tasks.set(data.download.pid, data.download)
                break;
        }

        // send message to socket

        return isFinish;
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

        this.tasks.get(data.pid).isPending = false;
        this.tasks.get(data.pid).isRunning = true;

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
            console.debug(message.toString());
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

/**
 * @todo remove
 *
(function downloadTester() {

    const p = DownloadProvider.getInstance();
    p.downloadVideo(
        {
            name: "peppa-pig_2017#116",
            path: "/tmp",
            uri: "https://www.youtube.com/watch?v=7uXd6evBz-8",
        }
    );

    p.downloadVideo(
        {
            name: "peppa_wutz_2017#82",
            path: "/tmp",
            uri: "https://www.youtube.com/watch?v=r1OT_kNQLg4",
        }
    );

    p.downloadVideo(
        {
            name: "peppa_wutz_2017#135",
            path: "/tmp",
            uri: "https://www.youtube.com/watch?v=k0-__7HGtd4",
        }
    );

    p.downloadVideo(
        {
            name: "peppa_wutz_2017#104",
            path: "/tmp",
            uri: "https://www.youtube.com/watch?v=9s9ZjeoWJB0",
        }
    );

    p.downloadVideo(
        {
            name: "peppa_wutz_2017#131",
            path: "/tmp",
            uri: "https://www.youtube.com/watch?v=oW--lfq19Zk",
        }
    );
}());
*/
