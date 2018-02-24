import * as fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import { AppConfig } from "../../AppConfig";
import { Logger } from "../../Log";
import * as ytdl from "ytdl-core";
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_PROGRESS
} from "../api";

class DownloadTask {

    private directory: string = AppConfig.get('paths.media.video');
    private fileName: string = "yt-download";
    private uri: string;
    private fileStream: fs.WriteStream;

    private logger = Logger.getInstance();

    private processId: string;

    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    public initialize() {
        this.loadProcessParameters();

        process.on("message", (id = "123") => {
            this.processId =  123;

            this.initializeDownload()
                .then(() => {
                    this.processDownload();
                })
                .catch((error) => {
                    this.logger.log(Logger.LOG_ERROR, `${__filename}: ${error}`);
                    process.send({
                        error,
                        processId: this.processId,
                        state: DOWNLOAD_STATE_ERROR,
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
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`, {flags: 'wx' });
        this.fileStream.on('error', (error) => {
            this.logger.log(Logger.LOG_ERROR, `${__filename}: ${error}`);
        });

        // create youtube download stream
        const stream = ytdl(this.uri);
        stream.on("response", this.onResponse.bind(this));
        stream.on("progress", this.onProgress.bind(this));
        stream.on("end",      () => {
            this.onEnd();
            stream.removeAllListeners();
        });
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
            this.validateDirectory();
            await ytdl.getInfo(this.uri);
        } catch (exception) {
            return Promise.reject(exception.message);
        }

        return Promise.resolve();
    }

    /**
     * checks directory exist and if not try to create it
     * 
     * @private
     * @memberof DownloadTask
     */
    private validateDirectory() {

        if ( fs.existsSync(this.directory) ) {
            const directoryStats = fs.statSync(this.directory);
            if ( ! directoryStats.isDirectory() ) {
                throw new Error(`${this.directory} exists but is not an directory.`);
            }
        } else {
            fs.mkdirSync(this.directory);
        }
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
            state: DOWNLOAD_STATE_START,
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

        this.logger.log(Logger.LOG_DEBUG, 'progressing download');
        process.send({
            data: {
                loaded,
                total
            },
            processId: this.processId,
            state: DOWNLOAD_STATE_PROGRESS,
        });
    };

    /**
     * download has finished
     */
    private onEnd() {
        process.send({
            data: {},
            processId: this.processId,
            state: DOWNLOAD_STATE_END,
        });
        process.exit(0);
    };
}

const downloadTask: DownloadTask = new DownloadTask();
console.log("WTF");
downloadTask.initialize();
