import * as fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import { AppConfig } from "../../AppConfig";
import * as ytdl from "ytdl-core";
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_PROGRESS
} from "../api";
import { FileExistsException } from '../model/exception/FileExists';

class DownloadTask {

    private directory: string = AppConfig.get('paths.media.video');

    private fileName: string = "yt-download";

    private uri: string;

    private fileStream: fs.WriteStream;

    private total: number = 0;

    private loaded: number = 0;

    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    public initialize() {
        this.loadProcessParameters();

            this.initializeDownload()
                .then(() => {
                    this.processDownload();
                })
                .catch( (exception) => {
                    if ( exception instanceof FileExistsException ) {
                        this.finishDownload(exception.message, DOWNLOAD_STATE_END);
                    } else {
                        this.finishDownload(exception.message || exception, DOWNLOAD_STATE_ERROR);
                    }
                })
    }

    /**
     * processing download
     */
    public processDownload() {

        // create file for download
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`, {flags: 'wx' });

        // create youtube download stream
        const stream = ytdl(this.uri);
        stream.on("response", this.onResponse.bind(this));
        stream.on("progress", this.onProgress.bind(this));
        stream.on("end"     , () => {
            stream.removeAllListeners();
            this.finishDownload('Download finished', DOWNLOAD_STATE_END);
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
     * 
     * 
     * @private
     * @returns {Promise<ytdl.videoInfo>} 
     * @memberof DownloadTask
     */
    private async initializeDownload(): Promise<ytdl.videoInfo>
    {
        this.validateDirectory();
        this.validateFile(`${this.directory}/${this.fileName}`);
        return ytdl.getInfo(this.uri);
    }

    /**
     * video response has been found and start downloading
     *
     * @param {IncomingMessage} response
     */
    private onResponse(response: IncomingMessage)
    {

        const headers: IncomingHttpHeaders = response.headers;
        const total: number = parseInt(headers["content-length"] as string, 10);

        this.total = total;
        this.updateDownload('Download starting', DOWNLOAD_STATE_START);
    }

    /**
     * download in progress
     *
     * @param {number} chunk length
     * @param {number} loaded downloaded total
     * @param {number} size total size
     */
    private onProgress(chunk: number, loaded: number)
    {
        this.loaded = loaded;
        this.updateDownload('Download in progress', DOWNLOAD_STATE_PROGRESS);
    };

    private updateDownload(message, state): void
    {
        process.send({
            data: {
                message,
                file: `${this.directory}/${this.fileName}`,
                loaded: this.loaded,
                total: this.total
            },
            state
        });
    }

    private finishDownload(message: string = "", state): void 
    {
        this.updateDownload(message, state);
        process.exit(0);
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
                throw new DirectoryNotExistsException(`${this.directory} exists but is not an directory.`);
            }
        } else {
            fs.mkdirSync(this.directory);
        }
    }

    private validateFile(path: string) {
        if ( fs.existsSync(path) ) {
            throw new FileExistsException(`file allready exists: ${this.fileName}`);
        }
    }
}

const downloadTask: DownloadTask = new DownloadTask();
downloadTask.initialize();
