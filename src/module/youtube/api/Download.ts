export interface IDownload {

    state: string;

    loaded: number;

    name: string;

    path: string;

    pid: string;

    size: number;

    uri: string;
};

export const ACTION_DOWNLOAD_CANCEL      = "canceled";
export const ACTION_DOWNLOAD_END         = "finished";
export const ACTION_DOWNLOAD_INITIALIZED = "initialized";
export const ACTION_DOWNLOAD_QUEUED      = "pending";
export const ACTION_DOWNLOAD_PROGRESS    = "progressing";
export const ACTION_DOWNLOAD_START       = "starting";
export const ACTION_DOWNLOAD_UPDATE      = "update";
