export interface IDownloadTask {

    state: string;

    loaded: number;

    param: {[key: string]: any};

    pid: string;

    size: number;

    task: string;
};

export const ACTION_DOWNLOAD_CANCEL      = "canceled";
export const ACTION_DOWNLOAD_END         = "finished";
export const ACTION_DOWNLOAD_INITIALIZED = "initialized";
export const ACTION_DOWNLOAD_QUEUED      = "pending";
export const ACTION_DOWNLOAD_PROGRESS    = "progressing";
export const ACTION_DOWNLOAD_START       = "starting";
export const ACTION_DOWNLOAD_UPDATE      = "update";
