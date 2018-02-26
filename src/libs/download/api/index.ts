import * as path from "path";

export * from "./Download";
export * from "./Message";
export * from "./DownloadData";

export const DOWNLOAD_STATE_CANCEL         = "cancel";
export const DOWNLOAD_STATE_END            = "end";
export const DOWNLOAD_STATE_ERROR          = "error";
export const DOWNLOAD_STATE_INITIALIZED    = "initialized";
export const DOWNLOAD_STATE_PROGRESS       = "progress";
export const DOWNLOAD_STATE_QUEUED         = "queued";
export const DOWNLOAD_STATE_START          = "start";
export const DOWNLOAD_STATE_UPDATE         = "update";
export const DOWNLOAD_TASK_MEDIA           = path.join(__dirname, "../tasks/media.js");
export const DOWNLOAD_TASK_YOUTUBE         = path.join(__dirname, "../tasks/ytdl.js");
export const EVENT_DOWNLOAD_FINISHED       = "download:end"
export const EVENT_VIDEO_DOWNLOAD_FINISHED = "download-video:end"
