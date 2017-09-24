export interface IDownload {

    isPending: boolean;

    isRunning: boolean;

    loaded: number;

    name: string;

    path: string;

    pid: string;

    size: number;

    uri: string;
};

export const ACTION_DOWNLOAD_END = "end";
export const ACTION_DOWNLOAD_START = "start";
export const ACTION_DOWNLOAD_PROGRESS = "progress";
