import * as fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import * as ytdl from "ytdl-core";

class DownloadTask {

    /**
     * codes should send to DownloadProvider
     */
    public static readonly DOWNLOAD_STATE_END = "end";
    public static readonly DOWNLOAD_STATE_ERROR = "error";
    public static readonly DOWNLOAD_STATE_PROGRESS = "progress";
    public static readonly DOWNLOAD_STATE_START = "start";

    private directory: string = "/tmp";
    private fileName: string = "yt-download";
    private uri: string;
    private fileStream: fs.WriteStream;

    private processId: string;

    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    public initialize() {
        this.loadProcessParameters();
        process.on("message", (id) => {
            this.processId = id;

            this.initializeDownload()
                .then(() => {
                    this.processDownload();
                })
                .catch((error) => {
                    process.send({
                        error,
                        processId: this.processId,
                        state: DownloadTask.DOWNLOAD_STATE_ERROR,
                    });
                    process.exit(1);
                });
        });
    }

    /**
     * processing download
     */
    public processDownload() {
        // create file for download
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);

        // create youtube download stream
        const stream = ytdl(this.uri);
        stream.on("response", this.onResponse.bind(this));
        stream.on("progress", this.onProgress.bind(this));
        stream.on("end",      this.onEnd.bind(this));
        stream.pipe(this.fileStream);
    }

    /**
     * parse process arguments
     */
    private loadProcessParameters() {

        const args = process.argv.slice(2);

        for (let i = 0, ln = args.length; i < ln; i++) {

            // tslint:disable-next-line:switch-default
            switch (args[i]) {
                case "--dir":
                    i++;
                    this.directory = args[i];
                    break;
                case "--name":
                    i++;
                    this.fileName = args[i];
                    break;
                case "--uri":
                    i++;
                    this.uri = args[i];
                    break;
            }
        }
    }

    /**
     * try to load meta informations from the video
     *
     * @returns {boolean}
     */
    private async initializeDownload() {
        try {
            await ytdl.getInfo(this.uri);
        } catch (exception) {
            return Promise.reject(exception.message);
        }
        return Promise.resolve();
    }

    /**
     * video response has been found and start downloading
     *
     * @param {IncomingMessage} response
     */
    private onResponse(response: IncomingMessage) {

        const headers: IncomingHttpHeaders = response.headers;
        const total: number = parseInt(headers["content-length"] as string, 10);

        process.send({
            data: {
                loaded: 0,
                total
            },
            processId: this.processId,
            state: DownloadTask.DOWNLOAD_STATE_START,
        });
    }

    /**
     * download in progress
     *
     * @param {number} chunk length
     * @param {number} loaded downloaded total
     * @param {number} size total size
     */
    private onProgress(chunk: number, loaded: number, total: number) {
        process.send({
            data: {
                loaded,
                total
            },
            processId: this.processId,
            state: DownloadTask.DOWNLOAD_STATE_PROGRESS,
        });
    };

    /**
     * download has finished
     */
    private onEnd() {
        process.send({
            data: {},
            processId: this.processId,
            state: DownloadTask.DOWNLOAD_STATE_END,
        });
        process.exit(0);
    };
}

const downloadTask: DownloadTask = new DownloadTask();
downloadTask.initialize();
