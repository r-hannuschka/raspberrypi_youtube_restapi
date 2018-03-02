import * as path from "path";
import { ILogConfig } from 'rh-utils';
import { IDownloadConfig } from 'rh-download';

const baseUrl = "http://localhost:8080";
const mediaDir = path.join(__dirname, "../../media");
const logDir   = path.join(__dirname, "../../logs");

const log: ILogConfig = {
    directories: {
        default: logDir
    }
}

const download: IDownloadConfig = {
    youtube: {
        dir: `${mediaDir}/video`
    },
    image: {
        dir: `${mediaDir}/image`
    }
}

export const config = {
    maria_db: {
        database: "raspberry_youtube",
        host: "127.0.0.1",
        password: "qwertz",
        username: "ralf"
    },
    download,
    log,
    web: {
        baseUrl,
        media: {
            base: `${baseUrl}/media`,
            image: `${baseUrl}/media/image`
        }
    }
}
