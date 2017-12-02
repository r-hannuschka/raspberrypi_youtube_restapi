import * as path from "path";

const baseUrl = "http://localhost:8080";

export const config = {
    download: {
        root_directory: "/media/youtube"
    },
    maria_db: {
        database: "raspberry_youtube",
        host: "127.0.0.1",
        password: "qwertz",
        username: "ralf"
    },
    paths: {
        logs: path.join(__dirname, "../../logs"),
        media: path.join(__dirname, "../../media")
    },
    task: {
        download: {
            media: path.join(__dirname, "../tasks/download/media.js"),
            ytdl: path.join(__dirname, "../tasks/download/ytdl.js")
        }
    },
    web: {
        baseUrl,
        media: `${baseUrl}/media`
    }
}
