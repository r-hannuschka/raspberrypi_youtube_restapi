import * as async from "async";
import {ChildProcess, fork} from "child_process";
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

export class DownloadProvider
{
    private static instance: DownloadProvider = new DownloadProvider();

    private downloadQueue: any;

    public constructor()
    {
        if ( DownloadProvider.instance ) {
            throw new Error("use DownloadProvider::getInstance()");
        }

        this.downloadQueue = async.queue(
            (data, done) => {
                this.runTask(data, done)
            },
            2
        );
        DownloadProvider.instance = this;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof DownloadProvider
     */
    public static getInstance()
    {
        return DownloadProvider.instance;
    }

    public downloadVideo(data, cb)
    {
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
        this.downloadQueue.push(download);
    }

    private handleMessage(data: IDownloadMessage): boolean
    {
        let isFinish = false;

        // tslint:disable-next-line:switch-default
        switch ( data.action ) {
            case ACTION_DOWNLOAD_END:
                isFinish = true;
                break;
            case ACTION_DOWNLOAD_PROGRESS:
                break;
            case ACTION_DOWNLOAD_START:
                console.log ( data.download.size );
                break;
        }

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
    private runTask(data: IDownload, done)
    {
        data.isPending = false;
        data.isRunning = true;

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
            // not empty
            console.log(message.toString());
        });

        childProcess.stderr.on("data", (error) => {
            // @todo write error to log
            console.error(error.toString());
            childProcess.kill();
            done();
        });

        childProcess.on("message", (message: IDownloadMessage) => {
            if ( this.handleMessage(message) ) {
                console.log("done");
                done();
            }
        });

        childProcess.send(data);
    }
}

/**
 * @todo remove
 * (function downloadTester() {
 *
 *     const p = DownloadProvider.getInstance();
 *     p.downloadVideo(
 *         {
 *             name: "peppa-pig_2017#116",
 *             path: "/tmp",
 *             uri: "https://www.youtube.com/watch?v=7uXd6evBz-8",
 *         },
 *         () => {
 *             console.log("ich bin fertig");
 *         }
 *     );
 *
 *     p.downloadVideo(
 *         {
 *             name: "peppa_wutz_2017#82",
 *             path: "/tmp",
 *             uri: "https://www.youtube.com/watch?v=r1OT_kNQLg4",
 *         },
 *         () => {
 *             console.log("ich bin fertig");
 *         }
 *     );
 * 
 *     p.downloadVideo(
 *         {
 *             name: "peppa_wutz_2017#135",
 *             path: "/tmp",
 *             uri: "https://www.youtube.com/watch?v=k0-__7HGtd4",
 *         },
 *         () => {
 *             console.log("ich bin fertig");
 *         }
 *     );
 * 
 *     p.downloadVideo(
 *         {
 *             name: "peppa_wutz_2017#104",
 *             path: "/tmp",
 *             uri: "https://www.youtube.com/watch?v=9s9ZjeoWJB0",
 *         },
 *         () => {
 *             console.log("ich bin fertig");
 *         }
 *     );
 * 
 *     p.downloadVideo(
 *         {
 *             name: "peppa_wutz_2017#131",
 *             path: "/tmp",
 *             uri: "https://www.youtube.com/watch?v=oW--lfq19Zk",
 *         },
 *         () => {
 *             console.log("ich bin fertig");
 *         }
 *     );
 * }());
 */
