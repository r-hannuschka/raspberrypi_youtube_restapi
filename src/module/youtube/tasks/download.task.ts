import * as fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import * as ytdl from "ytdl-core";
import {
    ACTION_DOWNLOAD_END,
    ACTION_DOWNLOAD_PROGRESS,
    ACTION_DOWNLOAD_START,
    IDownload
} from "../api/Download";

let directory: string = "/tmp";
let fileName: string = "yt-download";
let uri: string;
let fileStream: fs.WriteStream;

/**
 * parse process arguments
 */
function parseArguments() {

    const args = process.argv.slice(2);

    for (let i = 0, ln = args.length; i < ln; i++) {

        // tslint:disable-next-line:switch-default
        switch (args[i]) {
            case "--dir":
                i++;
                directory = args[i];
                break;
            case "--name":
                i++;
                fileName = args[i];
                break;
            case "--uri":
                i++;
                uri = args[i];
                break;
        }
    }

    console.log ( directory );
}

function initDownload(data: IDownload) {

    const download: IDownload = data;

    // send message download started
    fileStream = fs.createWriteStream(`${directory}/${fileName}`);

    const stream = ytdl(uri);

    stream.on("response", (response: IncomingMessage) => {
        const headers: IncomingHttpHeaders = response.headers;
        const size: number = parseInt(headers["content-length"] as string, 10);

        data.loaded = 0;
        data.size = size;

        process.send({
            action: ACTION_DOWNLOAD_START,
            download
        });
    });

    stream.on("progress", (chunk, total, size) => {

        download.loaded = total;

        process.send({
            action: ACTION_DOWNLOAD_PROGRESS,
            download
        });
    });

    stream.on("end", () => {
        process.send({
            action: ACTION_DOWNLOAD_END,
            download
        })
    });

    stream.pipe(fileStream);
}

(function downloadTask() {

    // parse arguments
    parseArguments();

    if ( ! uri ) {
        throw new Error("uri not submitted.");
    }

    process.on("message", (data: IDownload) => {
        initDownload(data);
    });
}());
