import * as fs from "fs";
import * as request from "request";
import { DOWNLOAD_STATE_END, DOWNLOAD_STATE_START } from "../api";

class ImageDownload {

    private directory: string = "/tmp";
    private fileName: string;
    private uri: string;
    private processId: string;
    private fileStream;

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

        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);
        const req = request(this.uri);
        req.on("response", () => {
                process.send({
                    data: {
                        loaded: 0,
                        total: 0
                    },
                    processId: this.processId,
                    state: DOWNLOAD_STATE_START
                });
            })
            .on("data", () => {
                process.send({
                    data: {
                        loaded: 0,
                        total: 0
                    },
                    processId: this.processId,
                    state: "progress"
                });
            })
            .pipe(this.fileStream)
            .on("close", () => {
                process.send({
                    data: {
                        loaded: 0,
                        total: 0
                    },
                    processId: this.processId,
                    state: DOWNLOAD_STATE_END
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