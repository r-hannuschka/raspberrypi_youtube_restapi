import * as path from "path";
import { IDownloadConfig } from "rh-download";

export const downloadConfig: IDownloadConfig = {
    keepNameAsFilename: false, // this will generate a filename
    paths: {
        image: path.resolve( process.cwd(), "./media/image"),
        ytdl:  path.resolve( process.cwd(), "./media/video")
    }
};
