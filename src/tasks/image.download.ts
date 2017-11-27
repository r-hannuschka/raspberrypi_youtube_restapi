import * as fs from "fs";
import { get as httpGet, IncomingHttpHeaders, IncomingMessage } from "http";
import { parse as urlParse } from "url";
import { DOWNLOAD_STATE_END } from "../api/download/index";

class ImageDownload {

    /**
     * codes should send to DownloadProvider
     */
    public static readonly DOWNLOAD_STATE_END = "end";
    public static readonly DOWNLOAD_STATE_ERROR = "error";
    public static readonly DOWNLOAD_STATE_START = "start";

    private directory: string = "/tmp";
    private fileName: string;
    private uri: string;
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
            this.processDownload();
        });
    }

    /**
     * processing download
     */
    public processDownload() {

        // create file for download
        const fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);
        const url        = urlParse(this.uri);
        const options    = {
            host: url.host,
            path: url.path,
            port: url.port || 80
        }

        httpGet(options, (res: IncomingMessage) => {

            process.send({
                data: {
                    loaded: 0,
                    total: 0
                },
                processId: this.processId,
                state: ImageDownload.DOWNLOAD_STATE_START
            });

            res.on("data", (data) => {
                fileStream.write(data);
                // progressing download we could send a message here

                process.send({
                    data: {
                        loaded: 0,
                        total: 0
                    },
                    processId: this.processId,
                    state: "progress"
                });
            });

            res.on("end", () => {
                fileStream.end();
                process.send({
                    data: {
                        loaded: 0,
                        total: 0
                    },
                    processId: this.processId,
                    state: ImageDownload.DOWNLOAD_STATE_END
                });
            });
        });
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
}

const downloadTask: ImageDownload = new ImageDownload();
downloadTask.initialize();