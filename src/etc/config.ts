import * as path from "path";

const baseUrl = "http://localhost:8080";

const mediaDir = path.join(__dirname, "../../media");
const logDir   = path.join(__dirname, "../../logs");

export const config = {
    maria_db: {
        database: "raspberry_youtube",
        host: "127.0.0.1",
        password: "qwertz",
        username: "ralf"
    },
    paths: {
        logs: {
            debug: `${logDir}/debug.log`,
            error: `${logDir}/error.log`,
            root : logDir
        },
        media: {
            base: mediaDir,
            image: `${mediaDir}/image`,
            video: `${mediaDir}/video`
        }
    },
    videoPlayer: {
        omx: {
            output: "hdmi"
        },
        vlc: {
        }
    },
    web: {
        baseUrl,
        media: {
            base: `${baseUrl}/media`,
            image: `${baseUrl}/media/image`
        }
    }
}
