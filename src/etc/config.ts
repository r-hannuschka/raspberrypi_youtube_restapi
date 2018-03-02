import * as path from "path";
import { ILogConfig } from 'rh-utils';
import { IDownloadConfig } from 'rh-download';

const baseUrl = "http://localhost:8080";
const mediaDir = path.join(__dirname, "../../media");
const logDir   = path.join(__dirname, "../../logs");

const logConfig: ILogConfig = {
    directories: {
        default: logDir
    }
}

const downloadConfig: IDownloadConfig = {
    youtube: {
        destinationDirectory: mediaDir
    }
}

export const config = {
    maria_db: {
        database: "raspberry_youtube",
        host: "127.0.0.1",
        password: "qwertz",
        username: "ralf"
    },
    download: downloadConfig,
    log: logConfig,
    web: {
        baseUrl,
        media: {
            base: `${baseUrl}/media`,
            image: `${baseUrl}/media/image`
        }
    }
}
